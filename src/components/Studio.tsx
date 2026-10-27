import { useEffect, useLayoutEffect, useRef } from 'react'
import { approach, demoTestimonials } from '../data/content'
import { trust } from '../config/site'
import { gsap, prefersReducedMotion, revealHeading } from '../lib/motion'
import { Img } from './Img'
import { asset } from '../lib/asset'

/** A. Architectural wireframe: lines draw, become a room outline, then photography takes over. */
function Wireframe() {
  const paths = [
    'M0 360 H1600',
    'M240 0 V900 M1360 0 V900',
    'M420 160 L620 300 H980 L1180 160',
    'M620 300 V640 H980 V300',
    'M420 160 V800 L620 640 M1180 160 V800 L980 640',
    'M420 800 H1180',
    'M700 640 V420 H900 V640',
    'M1040 330 V600 L1120 650 V250 Z',
    'M480 760 L560 700 H760 L700 760 Z',
  ]
  return (
    <svg className="wire absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} fill="none" stroke="#1d1b19" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
      ))}
    </svg>
  )
}

export function Studio() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    if (prefersReducedMotion()) {
      el.querySelectorAll<SVGPathElement>('.wire path').forEach((p) => (p.style.strokeDashoffset = '0'))
      return
    }
    const undo = revealHeading(el.querySelector('h2')!, { after: Array.from(el.querySelectorAll('.studio-intro')) })
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.wire-stage', start: 'top 85%', end: 'center 40%', scrub: 0.8 },
      })
      tl.to('.wire path', { strokeDashoffset: 0, stagger: 0.08, duration: 0.6, ease: 'none' })
        .fromTo('.wire-photo', { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'none' }, '-=0.2')
        .to('.wire', { autoAlpha: 0, duration: 0.4 }, '<0.3')
      gsap.from('.approach li', {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.approach', start: 'top 80%', once: true },
      })
      gsap.fromTo('.studio-portrait', { yPercent: 10 }, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.wire-stage', start: 'top bottom', end: 'bottom top', scrub: true } })
    }, el)
    return () => {
      undo()
      ctx.revert()
    }
  }, [])

  // Ambient studio footage only plays while visible.
  useEffect(() => {
    const v = root.current?.querySelector<HTMLVideoElement>('.studio-video')
    if (!v || prefersReducedMotion()) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!v.src) v.src = asset('video/studio-ambient.mp4')
        v.play().catch(() => {})
      } else v.pause()
    })
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={root} id="studio" className="bg-[var(--color-ivory)] py-28 lg:py-40" aria-labelledby="studio-title">
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)]">
        <div className="mb-16 grid gap-6 lg:grid-cols-12">
          <p className="section-num lg:col-span-2">(06) Studio</p>
          <h2 id="studio-title" className="display text-[clamp(3rem,7.5vw,8rem)] lg:col-span-7">
            Design With <em>Intention.</em>
          </h2>
          <p className="studio-intro self-end text-[var(--color-muted)] lg:col-span-3">
            Every decision — a sightline, a joint, a shade of plaster — is made for the people who will live with it.
          </p>
        </div>

        <div className="wire-stage relative grid gap-4 lg:grid-cols-12">
          <div className="relative aspect-[16/11] overflow-hidden rounded-[4px] bg-[var(--color-ivory-2)] lg:col-span-8">
            <Img name="studio-moodboard" alt="Studio wall with pinned sketches and stone, timber, fabric and bronze samples above an oak table" w={1024} h={1024} sizes="(min-width:1024px) 66vw, 100vw" className="wire-photo h-full w-full object-cover" />
            <Wireframe />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-4">
            <div className="studio-portrait aspect-[4/5] overflow-hidden rounded-[4px]">
              <Img name="studio-hands" alt="A designer arranging travertine, oak, linen and bronze samples on a drawing" w={1024} h={1024} sizes="(min-width:1024px) 33vw, 100vw" className="h-full w-full object-cover" />
            </div>
            <div className="relative aspect-video overflow-hidden rounded-[4px] bg-[var(--color-charcoal)]">
              <video className="studio-video h-full w-full object-cover" muted loop playsInline preload="none" poster={asset('video/studio-ambient-poster.jpg')} aria-label="Ambient footage of a calm, minimal interior" />
              <span className="absolute bottom-2 right-3 text-[0.55rem] tracking-wider text-white/50">Stock footage · Mixkit</span>
            </div>
          </div>
        </div>

        <ol className="approach mt-20 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-5">
          {approach.map((a, i) => (
            <li key={a.title} className="border-t border-black/15 pt-6">
              <span className="section-num">0{i + 1}</span>
              <h3 className="display mt-3 text-[1.7rem] leading-tight">{a.title}</h3>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{a.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Trust() {
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    return revealHeading(el.querySelector('h2')!, { after: Array.from(el.querySelectorAll('.trust-fade')) })
  }, [])

  const hasVerified = trust.stats.length + trust.credentials.length + trust.memberships.length + trust.media.length > 0

  return (
    <section ref={root} id="trust" className="bg-[var(--color-ivory-2)] py-28 lg:py-36" aria-labelledby="trust-title">
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)]">
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="trust-title" className="display text-[clamp(2.6rem,5.6vw,6rem)]">
            In their <em>words</em>
          </h2>
          {!trust.testimonialsAreVerified && (
            <p className="trust-fade inline-flex items-center gap-2 self-start rounded-full border border-[var(--color-bronze)]/40 px-4 py-2 text-[0.7rem] font-semibold tracking-[0.16em] text-[var(--color-bronze-deep)] lg:self-auto">
              DEMONSTRATION PLACEHOLDERS — NOT REAL REVIEWS
            </p>
          )}
        </div>

        <ul className="grid gap-px overflow-hidden rounded-[4px] bg-black/10 md:grid-cols-3">
          {demoTestimonials.map((t, i) => (
            <li key={i} className="trust-fade flex flex-col justify-between gap-10 bg-[var(--color-ivory-2)] p-8 lg:p-10">
              <blockquote>
                <p className="display text-[1.65rem] leading-snug text-[var(--color-charcoal)]/70">“{t.quote}”</p>
              </blockquote>
              <p className="text-xs tracking-[0.16em] text-[var(--color-muted)]">
                {t.name.toUpperCase()} · {t.project.toUpperCase()}
              </p>
            </li>
          ))}
        </ul>

        {hasVerified ? (
          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {trust.stats.map((s) => (
              <div key={s.label}>
                <p className="display text-6xl">{s.value}</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{s.label}</p>
              </div>
            ))}
            {trust.credentials.length > 0 && <TrustList title="Credentials" items={trust.credentials} />}
            {trust.memberships.length > 0 && <TrustList title="Memberships" items={trust.memberships} />}
            {trust.media.length > 0 && <TrustList title="As featured in" items={trust.media.map((m) => m.name)} />}
          </div>
        ) : (
          <p className="trust-fade mt-10 max-w-2xl text-sm text-[var(--color-muted)]">
            Project statistics, professional credentials, industry memberships and media features appear here once the
            studio supplies verified details.
          </p>
        )}
      </div>
    </section>
  )
}

function TrustList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="eyebrow mb-4 text-[var(--color-muted)]">{title}</p>
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  )
}
