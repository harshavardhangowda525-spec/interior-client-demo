import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { hasFinePointer, prefersReducedMotion } from '../lib/motion'
import { whatsappLink } from '../config/site'

/** A soft ring that trails the native pointer — the native cursor stays visible. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const [enabled] = useState(() => hasFinePointer() && !prefersReducedMotion())

  useEffect(() => {
    if (!enabled) return
    const el = ring.current!
    const pos = { x: -100, y: -100 }
    const cur = { x: -100, y: -100 }
    let raf = 0
    const move = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      const t = e.target as Element
      el.classList.toggle('hover', !!t.closest?.('a, button, [role="slider"], .mat-card, label'))
    }
    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.18
      cur.y += (pos.y - cur.y) * 0.18
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
    }
  }, [enabled])

  return enabled ? <div ref={ring} className="cursor-ring" aria-hidden="true" /> : null
}

const railSections = [
  ['home', 'Intro'],
  ['sequence', 'Vision'],
  ['projects', 'Projects'],
  ['transformation', 'Before / After'],
  ['services', 'Services'],
  ['materials', 'Materials'],
  ['studio', 'Studio'],
  ['trust', 'Voices'],
  ['contact', 'Contact'],
] as const

/** Minimal vertical progress indicator with the current section number. */
export function ScrollRail() {
  const fill = useRef<HTMLSpanElement>(null)
  const [index, setIndex] = useState(0)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (fill.current) fill.current.style.transform = `scaleY(${max > 0 ? window.scrollY / max : 0})`
      let idx = 0
      railSections.forEach(([id], i) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) idx = i
      })
      setIndex(idx)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  if (pathname !== '/') return null
  return (
    <div className="pointer-events-none fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 mix-blend-difference xl:flex" aria-hidden="true">
      <span className="relative h-5 w-6 overflow-hidden font-serif text-sm italic text-white">
        <span key={index} className="absolute inset-0 animate-[railIn_0.6s_cubic-bezier(0.22,1,0.36,1)] text-center">
          {String(index + 1).padStart(2, '0')}
        </span>
      </span>
      <span className="relative block h-36 w-px bg-white/30">
        <span ref={fill} className="absolute inset-0 origin-top bg-white" style={{ transform: 'scaleY(0)' }} />
      </span>
      <span className="text-[0.6rem] tracking-[0.2em] text-white [writing-mode:vertical-rl]">{railSections[index][1].toUpperCase()}</span>
    </div>
  )
}

/** Discreet WhatsApp button — uses the single configured number. */
export function WhatsAppButton() {
  const link = whatsappLink()
  const label = link ? 'Chat with Lumora Interiors on WhatsApp' : 'WhatsApp number not configured yet — open the enquiry form'
  return (
    <a
      href={link || '/#contact'}
      target={link ? '_blank' : undefined}
      rel={link ? 'noopener noreferrer' : undefined}
      aria-label={label}
      title={label}
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[var(--color-ink)] py-2.5 pl-2.5 pr-2.5 text-[var(--color-ivory)] no-underline shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all duration-500 hover:pr-5 sm:bottom-7 sm:right-7"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-sand)] text-[var(--color-ink)]" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.04c-.24.68-1.43 1.32-1.97 1.37-.5.05-1.12.07-1.81-.11-.42-.13-.95-.31-1.64-.61-2.88-1.25-4.77-4.16-4.91-4.36-.14-.19-1.17-1.56-1.17-2.98 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.66.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.42.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.22.55.34.07.12.07.68-.17 1.36Z" />
        </svg>
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold tracking-[0.12em] opacity-0 transition-all duration-500 group-hover:max-w-[10rem] group-hover:opacity-100 group-focus-visible:max-w-[10rem] group-focus-visible:opacity-100">
        {link ? 'WHATSAPP US' : 'ENQUIRE'}
      </span>
    </a>
  )
}
