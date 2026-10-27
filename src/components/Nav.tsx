import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { sections } from '../data/nav'


/** Maps every on-page section to the nav item it belongs to. */
const navFor: Record<string, string> = {
  home: 'home',
  sequence: 'home',
  projects: 'projects',
  transformation: 'projects',
  services: 'services',
  materials: 'services',
  studio: 'studio',
  trust: 'studio',
  contact: 'contact',
}

export function Nav() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [overDark, setOverDark] = useState(true)
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  const menuBtn = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      // Light/dark nav depends on what is underneath the bar.
      const probe = document.elementsFromPoint(window.innerWidth / 2, 40).find((el) => el.closest('section, footer, header.page-hero'))
      setOverDark(!!probe?.closest('.on-dark'))
    }
    onScroll()
    // Lazy routes render a moment later — re-check once they are in place.
    const timers = [150, 600].map((ms) => window.setTimeout(onScroll, ms))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  useEffect(() => {
    if (!onHome) return
    const els = Object.keys(navFor)
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(navFor[e.target.id]))
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [onHome])

  // Mobile menu: lock scroll, close on Escape, keep focus inside.
  useEffect(() => {
    if (!open) return
    const trigger = menuBtn.current
    document.body.style.overflow = 'hidden'
    const first = panel.current?.querySelector<HTMLElement>('a, button')
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab' && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>('a, button'))
        const [a, b] = [items[0], items[items.length - 1]]
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault()
          b.focus()
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault()
          a.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      trigger?.focus()
    }
  }, [open])

  const href = (id: string) => (onHome ? `#${id}` : `${import.meta.env.BASE_URL}#${id}`)
  const dark = overDark && !open
  const textColor = dark ? 'text-white' : 'text-[var(--color-charcoal)]'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ${scrolled ? 'py-3' : 'py-6'} ${dark ? 'on-dark' : ''}`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-[var(--gutter)]">
        <Link to="/" viewTransition className={`flex items-center gap-2 no-underline ${textColor}`} aria-label="Lumora Interiors, home">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <path d="M4 28V12L16 4l12 8v16" />
            <path d="M11 28V17h10v11" />
            <circle cx="16" cy="11.5" r="1.6" fill="currentColor" stroke="none" />
          </svg>
          <span className="font-serif text-[1.35rem] tracking-[0.18em]">LUMORA</span>
        </Link>

        <nav aria-label="Primary" className={`hidden rounded-full p-1.5 transition-colors duration-500 md:flex ${dark ? 'glass' : 'glass-light'}`}>
          {sections.map((s) => (
            <a
              key={s.id}
              href={href(s.id)}
              className={`nav-item no-underline ${dark ? 'text-white/75' : 'text-[var(--color-muted)]'}`}
              aria-current={onHome && active === s.id ? 'true' : undefined}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <a href={href('contact')} className={`pill-btn hidden md:inline-flex ${dark ? 'pill-dark' : 'pill-ink'} !px-6 !py-3`}>
          Book a consultation
        </a>

        <button
          ref={menuBtn}
          type="button"
          className={`relative z-[60] flex h-11 w-11 items-center justify-center rounded-full md:hidden ${dark ? 'glass text-white' : 'glass-light text-[var(--color-charcoal)]'}`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-3 w-5" aria-hidden="true">
            <span className={`absolute left-0 h-px w-5 bg-current transition-all duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 h-px w-5 bg-current transition-all duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={panel}
        hidden={!open}
        className="fixed inset-0 z-[55] flex flex-col justify-between bg-[var(--color-ivory)] px-[var(--gutter)] pb-10 pt-28 md:hidden"
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={href(s.id)}
                  onClick={() => setOpen(false)}
                  className="display flex items-baseline gap-4 py-1 text-[2.8rem] text-[var(--color-charcoal)] no-underline"
                >
                  <span className="section-num text-sm">0{i + 1}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href={href('contact')} onClick={() => setOpen(false)} className="pill-btn pill-ink self-start">
          Book a consultation <span className="plus" aria-hidden="true">+</span>
        </a>
      </div>
    </header>
  )
}
