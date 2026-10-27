import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'node:crypto'
import { validateEnquiry } from '../src/lib/enquiry.js'

/**
 * POST /api/enquiry — validates, rate-limits and stores consultation requests
 * in Supabase. Secrets are read from server-side environment variables only:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (required to store enquiries)
 *   RESEND_API_KEY, ENQUIRY_NOTIFY_EMAIL, ENQUIRY_FROM_EMAIL  (optional email alert)
 *   ALLOWED_ORIGIN  (optional, e.g. https://www.lumorainteriors.com)
 */

const MIN_FILL_MS = 3000
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 5
const recent = new Map<string, number[]>() // best-effort, per warm instance

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const allowed = process.env.ALLOWED_ORIGIN
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', allowed)
    res.setHeader('Vary', 'Origin')
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key')
    return res.status(204).end()
  }
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' })
  if (allowed && req.headers.origin && req.headers.origin !== allowed) {
    return res.status(403).json({ ok: false, error: 'Origin not allowed.' })
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'Invalid request.' })

  // Spam protection: honeypot + minimum fill time + rate limit.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return res.status(400).json({ ok: false, error: 'Your enquiry could not be accepted.' })
  }
  if (typeof body.elapsedMs !== 'number' || body.elapsedMs < MIN_FILL_MS) {
    return res.status(400).json({ ok: false, error: 'Please take a moment to complete the form, then try again.' })
  }

  const { data, errors } = validateEnquiry(body)
  if (Object.keys(errors).length) {
    return res.status(422).json({ ok: false, error: 'Please correct the highlighted fields.', errors })
  }

  const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? '').split(',')[0].trim()
  const ipHash = createHash('sha256').update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '')).digest('hex').slice(0, 32)
  const now = Date.now()
  const hits = (recent.get(ipHash) ?? []).filter((t) => now - t < WINDOW_MS)
  if (hits.length >= MAX_PER_WINDOW) {
    return res.status(429).json({ ok: false, error: 'Too many enquiries from this connection. Please try again later.' })
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return res.status(503).json({ ok: false, error: 'Enquiry storage is not configured.' })
  }

  const idempotencyKey = String(req.headers['idempotency-key'] ?? '').slice(0, 64) || null
  const row = {
    full_name: data.fullName,
    phone: data.phone,
    email: data.email,
    project_type: data.projectType,
    location: data.location,
    budget: data.budget,
    start_window: data.startWindow,
    details: data.details,
    reference_project: typeof body.referenceProject === 'string' ? body.referenceProject.slice(0, 120) : null,
    consent: data.consent,
    ip_hash: ipHash,
    user_agent: String(req.headers['user-agent'] ?? '').slice(0, 300),
    idempotency_key: idempotencyKey,
  }

  try {
    // Persistent rate limit across instances.
    const since = new Date(now - WINDOW_MS).toISOString()
    const countRes = await fetch(`${url}/rest/v1/enquiries?select=id&ip_hash=eq.${ipHash}&created_at=gte.${since}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' },
    })
    const total = Number(countRes.headers.get('content-range')?.split('/')[1] ?? 0)
    if (total >= MAX_PER_WINDOW) {
      return res.status(429).json({ ok: false, error: 'Too many enquiries from this connection. Please try again later.' })
    }

    // Duplicate submissions (same idempotency key) are ignored, not re-stored.
    const insert = await fetch(`${url}/rest/v1/enquiries?on_conflict=idempotency_key`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal,resolution=ignore-duplicates',
      },
      body: JSON.stringify(row),
    })
    if (!insert.ok) {
      console.error('Supabase insert failed', insert.status, await insert.text())
      return res.status(502).json({ ok: false, error: 'Your enquiry could not be saved. Please try again shortly.' })
    }
  } catch (e) {
    console.error('Supabase request error', e)
    return res.status(502).json({ ok: false, error: 'Your enquiry could not be saved. Please try again shortly.' })
  }

  hits.push(now)
  recent.set(ipHash, hits)
  await notify(row).catch((e) => console.error('Notification failed', e))
  return res.status(200).json({ ok: true })
}

async function notify(row: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ENQUIRY_NOTIFY_EMAIL
  const from = process.env.ENQUIRY_FROM_EMAIL
  if (!apiKey || !to || !from) return
  const lines = Object.entries(row)
    .filter(([k]) => !['ip_hash', 'user_agent', 'idempotency_key'].includes(k))
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v ?? ''}`)
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to,
      reply_to: row.email,
      subject: `New consultation enquiry — ${row.full_name}`,
      text: lines.join('\n'),
    }),
  })
}

function safeParse(s: string) {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}
