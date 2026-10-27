import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '../data/projects'
import { gsap, hasFinePointer, prefersReducedMotion, revealHeading } from '../lib/motion'
import { Img } from './Img'

export function Projects() {
  const root = useRef<HTMLElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [fine] = useState(() => hasFinePointer() && !prefersReducedMotion())

  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const undo = revealHeading(el.querySelector('h2')!, { after: Array.from(el.querySelectorAll('.proj-intro')) })
    const ctx = gsap.context(() => {
      // Images expand from a small crop into the full composition as they scroll in.
      gsap.utils.toArray<HTMLElement>('.proj-img').forEach((wrap) => {
        gsap.fromTo(
          wrap,
          { clipPath: 'inset(18% 22% 18% 22%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: wrap, start: 'top 95%', end: 'top 35%', scrub: 0.8 },
          },
        )
        gsap.fromTo(
          wrap.querySelector('img'),
          { scale: 1.3, yPercent: -6 },
          { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
      gsap.utils.toArray<HTMLElement>('.proj-meta').forEach((m) => {
        gsap.from(m.children, {
          y: 30,
          opacity: 0,
          stagger: 0.08,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: m, start: 'top 85%', once: true },
        })
      })
    }, el)
    return () => {
      undo()
      ctx.revert()
    }
  }, [])

  // Cursor-following detail preview on desktop.
  useEffect(() => {
    if (!fine) return
    const p = preview.current!
    const pos = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    let raf = 0
    const move = (e: PointerEvent) => {
      pos.x = e.clientX + 24
      pos.y = e.clientY - 180
    }
    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.12
      cur.y += (pos.y - cur.y) * 0.12
      p.style.translate = `${cur.x}px ${cur.y}px`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
    }
  }, [fine])

  const hoveredProject = projects.find((p) => p.slug === hovered)

  return (
    <section ref={root} id="projects" className="relative bg-[var(--color-ivory)] py-28 lg:py-40" aria-labelledby="projects-title">
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)]">
        <div className="mb-20 grid gap-8 lg:mb-32 lg:grid-cols-12">
          <p className="section-num lg:col-span-2">(02) Portfolio</p>
          <h2 id="projects-title" className="display text-[clamp(3rem,7.5vw,8rem)] lg:col-span-7">
            Selected <em>Spaces</em>
          </h2>
          <div className="flex flex-col justify-end gap-4 lg:col-span-3">
            <p className="proj-intro text-[var(--color-muted)]">
              Six concept studies across homes and workplaces — each composed around light, material and the rhythm of
              daily life.
            </p>
            <p className="proj-intro text-xs text-[var(--color-muted)]/80">
              Demonstration projects with AI-generated imagery. Replace with the studio’s completed work.
            </p>
          </div>
        </div>

        <ol className="flex flex-col gap-28 lg:gap-44">
          {projects.map((p, i) => {
            const flip = i % 2 === 1
            return (
              <li key={p.slug}>
                <Link
                  to={`/projects/${p.slug}`}
                  viewTransition
                  className="proj-link group grid items-end gap-8 text-inherit no-underline lg:grid-cols-12"
                  onPointerEnter={() => setHovered(p.slug)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(null)}
                >
                  <div className={`proj-img aspect-[16/10] lg:col-span-8 ${flip ? 'lg:order-2 lg:col-start-5' : ''}`}>
                    <Img
                      name={p.image}
                      alt={p.alt}
                      sizes="(min-width: 1024px) 66vw, 100vw"
                      style={{ viewTransitionName: `proj-${p.slug}` }}
                    />
                  </div>
                  <div className={`proj-meta flex flex-col gap-4 lg:col-span-4 ${flip ? 'lg:order-1 lg:col-start-1 lg:row-start-1' : ''}`}>
                    <span className="section-num">{p.index}</span>
                    <h3 className="display text-[clamp(2.2rem,3.6vw,3.6rem)]">{p.title}</h3>
                    <p className="eyebrow text-[var(--color-bronze)]">
                      {p.category} · {p.location}
                    </p>
                    <p className="max-w-sm text-[var(--color-muted)]">{p.summary}</p>
                    <div className="flex items-center gap-2" aria-label="Material palette">
                      {p.palette.map((c) => (
                        <span key={c.name} title={c.name} className="h-5 w-5 rounded-full border border-black/10" style={{ background: c.hex }} />
                      ))}
                    </div>
                    <span className="mt-2 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.2em]">
                      VIEW PROJECT
                      <span className="block h-px w-10 bg-current transition-all duration-500 group-hover:w-16" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>

      {fine && (
        <div ref={preview} className={`cursor-preview ${hoveredProject ? 'on' : ''}`} aria-hidden="true">
          {projects.map((p) => (
            <img
              key={p.slug}
              src={`/images/${p.detail}-sm.webp`}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
              style={{ opacity: hovered === p.slug ? 1 : 0 }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
