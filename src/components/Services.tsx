import { useLayoutEffect, useRef, useState } from 'react'
import { services } from '../data/content'
import { gsap, prefersReducedMotion, revealHeading } from '../lib/motion'
import { Img } from './Img'

const serviceSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')

export function Services() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const undo = revealHeading(el.querySelector('h2')!, { after: [el.querySelector('.svc-intro')!] })
    const ctx = gsap.context(() => {
      gsap.from('.svc-row', {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.svc-list', start: 'top 80%', once: true },
      })
    }, el)
    return () => {
      undo()
      ctx.revert()
    }
  }, [])

  return (
    <section ref={root} id="services" className="on-dark bg-[var(--color-charcoal)] py-28 text-[var(--color-ivory)] lg:py-40" aria-labelledby="services-title">
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)]">
        <div className="mb-16 grid gap-6 lg:grid-cols-12">
          <p className="section-num lg:col-span-2 !text-[var(--color-sand)]">(04) Services</p>
          <h2 id="services-title" className="display text-[clamp(2.8rem,6.6vw,7rem)] lg:col-span-7">
            What we <em>design</em>
          </h2>
          <p className="svc-intro self-end text-white/60 lg:col-span-3">
            One studio from first sketch to final styling — for homes, workplaces and hospitality.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="relative hidden lg:col-span-5 lg:block">
            <div className="light-sweep sticky top-28 aspect-[4/5] overflow-hidden rounded-[4px]">
              {services.map((s, i) => (
                <Img
                  key={s.title}
                  name={s.image}
                  alt={s.alt}
                  w={1024}
                  h={1024}
                  sizes="40vw"
                  className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ opacity: i === active ? 1 : 0, transform: i === active ? 'scale(1)' : 'scale(1.08)' }}
                />
              ))}
              <span className="glass absolute bottom-5 left-5 rounded-full px-4 py-2 text-[0.65rem] font-semibold tracking-[0.22em]">
                0{active + 1} / 0{services.length}
              </span>
            </div>
          </div>

          <ol className="svc-list lg:col-span-7">
            {services.map((s, i) => {
              const isOpen = open === i
              return (
                <li
                  key={s.title}
                  className="svc-row border-t border-white/12 py-8 last:border-b"
                  onPointerEnter={() => setActive(i)}
                  onFocusCapture={() => setActive(i)}
                >
                  <div className="mb-5 aspect-[16/10] overflow-hidden rounded-[4px] lg:hidden">
                    <Img name={s.image} alt={s.alt} w={1024} h={1024} sizes="100vw" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-start gap-6">
                    <span className="section-num mt-2 !text-[var(--color-sand)]">0{i + 1}</span>
                    <div className="flex-1">
                      <h3
                        className={`display text-[clamp(1.9rem,3.2vw,3.1rem)] transition-[color,transform] duration-500 ${
                          active === i ? 'lg:translate-x-3 text-[var(--color-sand)]' : ''
                        }`}
                      >
                        {s.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-white/65">{s.text}</p>
                      <div
                        id={`svc-more-${i}`}
                        className="grid transition-[grid-template-rows] duration-500"
                        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                      >
                        <div className="overflow-hidden">
                          <p className="max-w-xl pt-3 text-white/80">{s.more}</p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          className="pill-btn pill-ghost !px-5 !py-2.5"
                          aria-expanded={isOpen}
                          aria-controls={`svc-more-${i}`}
                          onClick={() => setOpen(isOpen ? null : i)}
                        >
                          {isOpen ? 'Show less' : 'Discover more'}
                        </button>
                        <a href={`?type=${serviceSlug(s.title)}#contact`} className="text-xs font-semibold tracking-[0.18em] text-[var(--color-sand)] underline-offset-4 hover:underline">
                          BOOK A CONSULTATION →
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
