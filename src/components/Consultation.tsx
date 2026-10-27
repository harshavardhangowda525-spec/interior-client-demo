import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { site, whatsappLink } from '../config/site'
import { budgetBands, projectTypes, startWindows, validateEnquiry, type Enquiry, type EnquiryErrors } from '../lib/enquiry'
import { prefersReducedMotion, revealHeading } from '../lib/motion'
import { projects } from '../data/projects'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const typeFromParam: Record<string, string> = {
  'residential-interior-design': 'Residential interior',
  'commercial-interior-design': 'Commercial interior',
  'modular-kitchen-design': 'Modular kitchen',
  'space-planning': 'Space planning',
  '3d-interior-visualisation': '3D interior visualisation',
  'renovation-and-styling': 'Renovation and styling',
}

export function Consultation() {
  const root = useRef<HTMLElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const { search } = useLocation()
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const startedAt = useRef(Date.now())
  const idempotencyKey = useRef(crypto.randomUUID())

  const params = new URLSearchParams(search)
  const fromProject = projects.find((p) => p.slug === params.get('project'))
  const presetType = typeFromParam[params.get('type') ?? ''] ?? ''

  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    return revealHeading(el.querySelector('h2')!, { after: Array.from(el.querySelectorAll('.contact-fade')) })
  }, [])

  useEffect(() => {
    if (presetType && form.current) (form.current.elements.namedItem('projectType') as HTMLSelectElement).value = presetType
  }, [presetType])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'submitting') return
    const fd = new FormData(e.currentTarget)
    const raw = Object.fromEntries(fd.entries()) as Record<string, unknown>
    raw.consent = fd.get('consent') === 'on'
    const { data, errors: errs } = validateEnquiry(raw as Partial<Record<keyof Enquiry, unknown>>)
    setErrors(errs)
    if (Object.keys(errs).length) {
      setStatus('idle')
      const first = Object.keys(errs)[0]
      ;(e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus()
      return
    }
    setStatus('submitting')
    setMessage('')
    try {
      const res = await fetch(site.enquiryEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey.current },
        body: JSON.stringify({
          ...data,
          referenceProject: fromProject?.title ?? '',
          website: fd.get('website') ?? '', // honeypot
          elapsedMs: Date.now() - startedAt.current,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok && body.ok) {
        setStatus('success')
        setMessage('Thank you — your enquiry has been received. The studio will be in touch shortly.')
        form.current?.reset()
        idempotencyKey.current = crypto.randomUUID()
      } else {
        if (body.errors) setErrors(body.errors)
        setStatus('error')
        setMessage(
          res.status === 503
            ? 'Online enquiries are not connected yet, so your message was not sent. Please contact the studio directly.'
            : body.error || 'Something went wrong and your enquiry was not sent. Please try again.',
        )
      }
    } catch {
      setStatus('error')
      setMessage('We could not reach the server, so your enquiry was not sent. Please check your connection and try again.')
    }
  }

  const err = (k: keyof Enquiry) =>
    errors[k] ? (
      <span id={`${k}-err`} className="err" role="alert">
        {errors[k]}
      </span>
    ) : null
  const aria = (k: keyof Enquiry) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-err` : undefined })
  const wa = whatsappLink(fromProject ? `${site.whatsappMessage} (Ref: ${fromProject.title})` : undefined)

  return (
    <section ref={root} id="contact" className="on-dark relative overflow-hidden bg-[var(--color-ink)] py-28 text-[var(--color-ivory)] lg:py-40" aria-labelledby="contact-title">
      <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
        <img src="/images/scene-finished.webp" alt="" loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-ink)] via-[var(--color-ink)]/85 to-[var(--color-ink)]/40" />
      </div>
      <div className="relative mx-auto grid max-w-[1600px] gap-16 px-[var(--gutter)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="section-num mb-6 !text-[var(--color-sand)]">(08) Consultation</p>
          <h2 id="contact-title" className="display text-[clamp(3rem,6.4vw,6.8rem)]">
            Let’s Create Something <em className="text-[var(--color-sand)]">Exceptional.</em>
          </h2>
          <p className="contact-fade mt-8 max-w-md text-white/65">
            Tell us about your space, your plans and how you want it to feel. A designer will review your enquiry and
            arrange an initial consultation.
          </p>
          {fromProject && (
            <p className="contact-fade glass mt-6 inline-block rounded-full px-4 py-2 text-xs tracking-[0.12em]">
              Enquiring about: {fromProject.title}
            </p>
          )}
          <div className="contact-fade mt-10 flex flex-col gap-2 text-sm text-white/60">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="text-[var(--color-sand)] no-underline hover:underline">
                Prefer WhatsApp? Message the studio ↗
              </a>
            )}
            {site.contact.email && (
              <a href={`mailto:${site.contact.email}`} className="text-white/80 no-underline hover:underline">
                {site.contact.email}
              </a>
            )}
          </div>
        </div>

        <form ref={form} noValidate onSubmit={onSubmit} className="contact-fade grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-7" aria-describedby="privacy-note">
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" autoComplete="name" required {...aria('fullName')} />
            {err('fullName')}
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required {...aria('phone')} />
            {err('phone')}
          </div>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required {...aria('email')} />
            {err('email')}
          </div>
          <div className="field">
            <label htmlFor="projectType">Project type</label>
            <select id="projectType" name="projectType" defaultValue={presetType} required {...aria('projectType')}>
              <option value="" disabled>
                Select…
              </option>
              {projectTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            {err('projectType')}
          </div>
          <div className="field">
            <label htmlFor="location">Property location</label>
            <input id="location" name="location" autoComplete="address-level2" placeholder="City / neighbourhood" required {...aria('location')} />
            {err('location')}
          </div>
          <div className="field">
            <label htmlFor="budget">Approximate budget</label>
            <select id="budget" name="budget" defaultValue="" required {...aria('budget')}>
              <option value="" disabled>
                Select…
              </option>
              {budgetBands.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            {err('budget')}
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="startWindow">Expected start</label>
            <select id="startWindow" name="startWindow" defaultValue="" required {...aria('startWindow')}>
              <option value="" disabled>
                Select…
              </option>
              {startWindows.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            {err('startWindow')}
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="details">Additional project details</label>
            <textarea id="details" name="details" maxLength={2000} placeholder="Size of the space, rooms involved, style you love…" {...aria('details')} />
          </div>

          {/* Honeypot — hidden from people, tempting to bots */}
          <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-start gap-3 text-sm text-white/70">
              <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[var(--color-sand)]" {...aria('consent')} />
              <span id="privacy-note">
                I agree that Lumora Interiors may store these details and contact me about this enquiry. Read our{' '}
                <Link to="/privacy" className="text-[var(--color-sand)]">
                  privacy policy
                </Link>
                .
              </span>
            </label>
            {err('consent')}
          </div>

          <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
            <button type="submit" className="pill-btn pill-dark border border-white/15 disabled:cursor-wait disabled:opacity-60" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
              {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
              <span className="plus" aria-hidden="true">
                {status === 'submitting' ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : '+'}
              </span>
            </button>
            <p role="status" aria-live="polite" className={`text-sm ${status === 'success' ? 'text-[var(--color-sand)]' : status === 'error' ? 'text-[#f0b4a2]' : 'text-white/60'}`}>
              {message}
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
