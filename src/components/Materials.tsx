import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { materials } from '../data/content'
import { gsap, hasFinePointer, prefersReducedMotion, revealHeading } from '../lib/motion'

const floating = [
  { id: 'marble', x: 6, y: 8, w: 22, depth: 30, label: 'Marble' },
  { id: 'oak', x: 70, y: 0, w: 18, depth: 50, label: 'Oak' },
  { id: 'linen', x: 34, y: 46, w: 16, depth: 70, label: 'Linen' },
  { id: 'metal', x: 78, y: 54, w: 13, depth: 90, label: 'Bronze' },
  { id: 'travertine', x: 4, y: 62, w: 15, depth: 60, label: 'Travertine' },
]

export function Materials() {
  const root = useRef<HTMLElement>(null)
  const gallery = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const m = materials[active]

  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const undo = revealHeading(el.querySelector('h2')!, { after: Array.from(el.querySelectorAll('.mat-intro')) })
    const ctx = gsap.context(() => {
      gsap.from('.float-tile', {
        y: 80,
        opacity: 0,
        rotate: (i) => (i % 2 ? 6 : -6),
        stagger: 0.1,
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.float-gallery', start: 'top 80%', once: true },
      })
      gsap.from('.float-label', {
        xPercent: -30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        delay: 0.5,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.float-gallery', start: 'top 80%', once: true },
      })
      // Restrained scroll parallax on each tile.
      gsap.utils.toArray<HTMLElement>('.float-tile').forEach((t) => {
        gsap.to(t, {
          yPercent: -Number(t.dataset.depth) / 3,
          ease: 'none',
          scrollTrigger: { trigger: '.float-gallery', start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    }, el)
    return () => {
      undo()
      ctx.revert()
    }
  }, [])

  // Tiles respond subtly to the cursor.
  useEffect(() => {
    const g = gallery.current
    if (!g || !hasFinePointer() || prefersReducedMotion()) return
    const tiles = Array.from(g.querySelectorAll<HTMLElement>('.float-inner'))
    const setters = tiles.map((t) => ({
      x: gsap.quickTo(t, 'x', { duration: 1.2, ease: 'power3.out' }),
      y: gsap.quickTo(t, 'y', { duration: 1.2, ease: 'power3.out' }),
      d: Number(t.dataset.depth),
    }))
    const move = (e: PointerEvent) => {
      const r = g.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      setters.forEach((s) => {
        s.x(nx * s.d * 0.5)
        s.y(ny * s.d * 0.35)
      })
    }
    g.addEventListener('pointermove', move)
    return () => g.removeEventListener('pointermove', move)
  }, [])

  // Swap the large texture with a soft crossfade + scale.
  useEffect(() => {
    if (prefersReducedMotion()) return
    gsap.fromTo('.mat-hero-img', { scale: 1.08, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: 1.1, ease: 'expo.out' })
    gsap.fromTo('.mat-copy > *', { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: 'power3.out' })
  }, [active])

  return (
    <section ref={root} id="materials" className="bg-[var(--color-ivory)] py-28 lg:py-40" aria-labelledby="materials-title">
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)]">
        <div className="mb-16 grid gap-6 lg:grid-cols-12">
          <p className="section-num lg:col-span-2">(05) Materials</p>
          <h2 id="materials-title" className="display text-[clamp(2.8rem,6.6vw,7rem)] lg:col-span-6">
            Honest <em>materials,</em> chosen to age well.
          </h2>
          <p className="mat-intro self-end text-[var(--color-muted)] lg:col-span-4">
            Stone, timber, linen, metal and plaster — selected for how they feel underfoot, catch the light and wear
            over decades.
          </p>
        </div>

        {/* B. Floating material gallery */}
        <div ref={gallery} className="float-gallery relative mb-28 hidden h-[34rem] md:block" aria-hidden="true">
          {floating.map((f) => (
            <div
              key={f.id}
              className="float-tile absolute"
              data-depth={f.depth}
              style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%` }}
            >
              <div className="float-inner" data-depth={f.depth}>
                <img src={`/images/tex-${f.id}.webp`} alt="" loading="lazy" className="aspect-square w-full rounded-[3px] object-cover shadow-[0_30px_60px_rgba(29,27,25,0.18)]" />
                <span className="float-label mt-3 flex items-center gap-3 text-[0.65rem] font-semibold tracking-[0.25em] text-[var(--color-muted)]">
                  <span className="h-px w-6 bg-current" />
                  {f.label.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
          <div className="absolute left-[44%] top-[6%] w-[24%]">
            <img src="/images/materials-flatlay.webp" alt="" loading="lazy" className="aspect-square w-full rounded-[3px] object-cover" />
          </div>
        </div>

        {/* Interactive material explorer */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] lg:col-span-7 lg:aspect-auto lg:min-h-[36rem]">
            <img
              key={m.id}
              src={`/images/tex-${m.id}.webp`}
              alt={`${m.name} texture close-up`}
              className="mat-hero-img absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <p className="display absolute bottom-6 left-6 text-[clamp(2.6rem,6vw,5.6rem)] text-white" aria-hidden="true">
              {m.name}
            </p>
          </div>

          <div className="flex flex-col gap-10 lg:col-span-5">
            <div role="group" aria-label="Select a material" className="flex flex-wrap gap-2">
              {materials.map((mat, i) => (
                <button
                  key={mat.id}
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-xs font-semibold tracking-[0.08em] transition-colors duration-300 ${
                    i === active
                      ? 'border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-[var(--color-ivory)]'
                      : 'border-black/15 text-[var(--color-charcoal)] hover:border-black/40'
                  }`}
                >
                  <span className="h-6 w-6 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(/textures/${mat.id}.jpg)` }} aria-hidden="true" />
                  {mat.name}
                </button>
              ))}
            </div>

            <div className="mat-copy flex flex-col gap-5" aria-live="polite">
              <p className="eyebrow text-[var(--color-bronze)]">{m.origin}</p>
              <h3 className="display text-[clamp(2.4rem,4vw,3.6rem)]">{m.name}</h3>
              <p className="max-w-md text-[var(--color-muted)]">{m.text}</p>
              <div>
                <p className="eyebrow mb-3 text-[var(--color-muted)]">Coordinated palette</p>
                <div className="flex gap-2">
                  {[m.hex, ...m.swatches].map((c) => (
                    <span key={c} className="flex h-16 w-14 items-end rounded-[3px] p-1.5 text-[0.55rem] tracking-wider text-black/50" style={{ background: c }}>
                      <span className={parseInt(c.slice(1, 3), 16) < 120 ? 'text-white/70' : ''}>{c.toUpperCase()}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
