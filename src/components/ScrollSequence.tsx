import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion, ScrollTrigger } from '../lib/motion'
import { Img } from './Img'
import { asset } from '../lib/asset'

const VIDEO_SRC = asset('video/transformation-1280.mp4')

const scenes = [
  { n: '01', label: 'The Empty Space', text: 'Every great space begins with a vision.', image: 'scene-empty', alt: 'An empty contemporary room with sunlight falling across a stone floor' },
  { n: '02', label: 'The Design Process', text: 'Thoughtfully designed. Meticulously crafted.', image: 'scene-blueprint', alt: 'Architectural drawings with stone, timber and fabric samples on a desk' },
  { n: '03', label: 'The Transformation', text: 'From an idea to a place you call home.', image: 'scene-sketch', alt: 'Perspective sketch of the furnished room' },
  { n: '04', label: 'The Finished Space', text: 'Designed around the way you live.', image: 'scene-finished', alt: 'The finished living room with a bouclé sofa, leather chairs, walnut panelling and an olive tree' },
]

/** Floor plan of the room — drawn stroke by stroke during scene 02. */
function Blueprint() {
  const lines = [
    'M300 150 H1300 V750 H300 Z',
    'M300 150 L240 110 M1300 150 L1360 110 M1300 750 L1360 790 M300 750 L240 790',
    'M640 150 V230 H960 V150',
    'M700 230 H900 V200 H700 Z',
    'M1300 220 V680',
    'M1290 220 V680',
    'M300 300 H360 M300 360 H360',
    'M360 300 A60 60 0 0 1 300 360',
    'M440 420 H560 V640 H440 Z',
    'M450 430 H550 V500 H450 Z',
    'M920 430 H1020 V520 H920 Z M920 560 H1020 V650 H920 Z',
    'M660 470 m-70 0 a70 70 0 1 0 140 0 a70 70 0 1 0 -140 0',
    'M400 400 H1100 V700 H400 Z',
    'M1200 640 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0',
    'M300 820 H1300 M300 805 V835 M1300 805 V835',
    'M1390 150 V750 M1375 150 H1405 M1375 750 H1405',
    'M800 150 V100 M780 120 L800 100 L820 120',
  ]
  return (
    <svg className="blueprint absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="0" y="0" width="1600" height="900" style={{ fill: 'rgba(16,20,24,0.55)', stroke: 'none' }} />
      {lines.map((d, i) => (
        <path key={i} d={d} pathLength={1} className="bp-line" style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
      ))}
      <g className="bp-label" style={{ font: '500 14px Manrope, sans-serif', letterSpacing: '0.2em', fill: 'rgba(255,247,235,0.75)', stroke: 'none' }}>
        <text x="800" y="860" textAnchor="middle" style={{ fill: 'rgba(255,247,235,0.75)', stroke: 'none' }}>
          LIVING ROOM — 7.20 × 5.40 M
        </text>
        <text x="1420" y="455" style={{ fill: 'rgba(255,247,235,0.75)', stroke: 'none' }}>
          GLAZING
        </text>
      </g>
    </svg>
  )
}

export function ScrollSequence() {
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setPinned(mq.matches && !prefersReducedMotion())
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return pinned ? <PinnedSequence /> : <StackedSequence />
}

function PinnedSequence() {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [scene, setScene] = useState(0)

  // Load the video only when the section approaches the viewport.
  useEffect(() => {
    const el = root.current
    const v = video.current
    if (!el || !v) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !v.src) {
          v.src = VIDEO_SRC
          v.load()
          io.disconnect()
        }
      },
      { rootMargin: '150% 0px' },
    )
    io.observe(el)
    const onReady = () => setReady(true)
    v.addEventListener('loadeddata', onReady)
    return () => {
      io.disconnect()
      v.removeEventListener('loadeddata', onReady)
    }
  }, [])

  useLayoutEffect(() => {
    const el = root.current
    const v = video.current
    if (!el || !v) return
    let target = 0
    let raf = 0
    let slowSeeks = 0

    // Smoothly chase the scroll position; avoid queuing seeks while one is in flight.
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!v.duration || v.seeking) return
      const t = target * (v.duration - 0.05)
      if (Math.abs(v.currentTime - t) > 0.012) {
        const started = performance.now()
        v.currentTime = v.currentTime + (t - v.currentTime) * 0.35
        v.addEventListener(
          'seeked',
          () => {
            if (performance.now() - started > 220) slowSeeks++
            // Device can't seek fast enough: switch to still-image crossfades.
            if (slowSeeks > 12) el.classList.add('seq-fallback')
          },
          { once: true },
        )
      }
    }
    raf = requestAnimationFrame(loop)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=450%',
          pin: '.seq-stage',
          scrub: 0.6,
          onUpdate: (self) => {
            target = self.progress
            const p = self.progress
            setScene(p < 0.28 ? 0 : p < 0.58 ? 1 : p < 0.82 ? 2 : 3)
          },
        },
      })
      // Fallback stills crossfade with the same progress (used before the video is ready).
      tl.to('.seq-frame[data-i="1"]', { opacity: 1, duration: 0.06 }, 0.27)
        .to('.seq-frame[data-i="2"]', { opacity: 1, duration: 0.06 }, 0.55)
        .to('.seq-frame[data-i="3"]', { opacity: 1, duration: 0.1 }, 0.68)
        // Camera drift on the stage.
        .fromTo('.seq-cam', { scale: 1.06 }, { scale: 1, duration: 1 }, 0)
        // Scene 01
        .fromTo('.cap-0', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.03)
        .to('.cap-0', { autoAlpha: 0, y: -30, duration: 0.05 }, 0.22)
        // Scene 02 — blueprint lines draw themselves, swatches slide in
        .fromTo('.blueprint', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.3)
        .to('.bp-line', { strokeDashoffset: 0, duration: 0.12, stagger: 0.006 }, 0.31)
        .to('.blueprint', { autoAlpha: 0, duration: 0.05 }, 0.52)
        .fromTo('.seq-swatch', { xPercent: 140, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.06, stagger: 0.025, ease: 'power2.out' }, 0.38)
        .to('.seq-swatch', { xPercent: 140, autoAlpha: 0, duration: 0.05, stagger: 0.01 }, 0.53)
        .fromTo('.cap-1', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.33)
        .to('.cap-1', { autoAlpha: 0, y: -30, duration: 0.04 }, 0.53)
        // Scene 03 — transformation + brief before/after split
        .fromTo('.cap-2', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.6)
        .to('.cap-2', { autoAlpha: 0, y: -30, duration: 0.04 }, 0.76)
        .fromTo('.seq-split', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 50% 0 0)', duration: 0.05, ease: 'power2.out' }, 0.78)
        .fromTo('.seq-split-labels', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.8)
        .to('.seq-split-labels', { autoAlpha: 0, duration: 0.03 }, 0.86)
        .to('.seq-split', { clipPath: 'inset(0 100% 0 0)', duration: 0.05, ease: 'power2.in' }, 0.86)
        // Scene 04
        .fromTo('.cap-3', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.9)
        .to({}, { duration: 0.04 })
    }, el)

    return () => {
      cancelAnimationFrame(raf)
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    ScrollTrigger.refresh()
  }, [ready])

  return (
    <section ref={root} id="sequence" className={`seq on-dark ${ready ? 'seq-ready' : ''}`} aria-label="From vision to finished space">
      <div className="seq-stage">
        <div className="seq-cam absolute inset-0">
          {/* Still-image fallback — sits under the video, visible until it is ready */}
          {scenes.map((s, i) => (
            <Img
              key={s.image}
              name={s.image}
              alt=""
              w={1344}
              h={756}
              className="seq-frame"
              data-i={i}
              style={{ opacity: i === 0 ? 1 : 0 }}
            />
          ))}
          <video
            ref={video}
            muted
            playsInline
            preload="auto"
            poster={asset('images/scene-empty.webp')}
            aria-hidden="true"
            className="transition-opacity duration-700"
            style={{ opacity: ready ? 1 : 0 }}
          />
        </div>
        <div className="seq-shade" />
        <Blueprint />

        <div className="absolute right-[var(--gutter)] top-1/2 flex -translate-y-1/2 flex-col gap-3" aria-hidden="true">
          {['tex-marble', 'tex-travertine', 'tex-oak', 'tex-linen'].map((n) => (
            <img
              key={n}
              src={asset(`images/${n}.webp`)}
              alt=""
              className="seq-swatch h-[clamp(70px,11vh,120px)] w-[clamp(70px,11vh,120px)] rounded-[4px] object-cover shadow-2xl"
              style={{ opacity: 0 }}
              loading="lazy"
            />
          ))}
        </div>

        <div className="seq-split absolute inset-0" style={{ clipPath: 'inset(0 100% 0 0)' }} aria-hidden="true">
          <Img name="scene-empty" alt="" w={1344} h={756} className="h-full w-full object-cover" />
          <div className="absolute inset-y-0 right-0 w-[2px] bg-white" />
        </div>
        <div className="seq-split-labels pointer-events-none absolute inset-x-0 top-28 flex justify-around opacity-0" aria-hidden="true">
          <span className="glass rounded-full px-4 py-2 text-[0.65rem] font-semibold tracking-[0.25em]">BEFORE</span>
          <span className="glass rounded-full px-4 py-2 text-[0.65rem] font-semibold tracking-[0.25em]">AFTER</span>
        </div>

        {scenes.map((s, i) => (
          <h2 key={s.n} className={`seq-caption display cap-${i}`} style={{ opacity: 0 }}>
            <span className="eyebrow mb-4 block font-sans text-[0.65rem] text-[var(--accent)]">
              Scene {s.n} — {s.label}
            </span>
            {s.text}
          </h2>
        ))}

        <ol className="absolute bottom-10 right-[var(--gutter)] flex gap-6 text-[0.7rem] tracking-[0.2em]" aria-label="Sequence progress">
          {scenes.map((s, i) => (
            <li key={s.n} aria-current={i === scene ? 'step' : undefined} className="flex flex-col gap-2 transition-opacity duration-500" style={{ opacity: i === scene ? 1 : 0.4 }}>
              <span>{s.n}</span>
              <span className="block h-px w-10 bg-white/30">
                <span className="block h-px bg-[var(--accent)] transition-all duration-500" style={{ width: i <= scene ? '100%' : '0%' }} />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** Mobile / reduced-motion version: no pinning, static frames and one short clip. */
function StackedSequence() {
  const root = useRef<HTMLElement>(null)
  const reduced = prefersReducedMotion()

  useLayoutEffect(() => {
    if (reduced || !root.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.stack-scene').forEach((s) => {
        gsap.from(s.querySelector('.stack-media'), {
          clipPath: 'inset(12% 8% 12% 8%)',
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: s, start: 'top 80%', once: true },
        })
        gsap.from(s.querySelector('h2'), {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: s, start: 'top 70%', once: true },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  // Autoplay the transformation clip only while it is on screen.
  useEffect(() => {
    const v = root.current?.querySelector('video')
    if (!v || reduced) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!v.src) v.src = asset('video/transformation-640.mp4')
        v.play().catch(() => {})
      } else v.pause()
    })
    io.observe(v)
    return () => io.disconnect()
  }, [reduced])

  return (
    <section ref={root} id="sequence" className="seq on-dark py-16" aria-label="From vision to finished space">
      {scenes.map((s, i) => (
        <article key={s.n} className="stack-scene px-[var(--gutter)] py-8">
          <div className="stack-media relative aspect-[4/5] overflow-hidden rounded-[4px] sm:aspect-video">
            {i === 2 && !reduced ? (
              <video muted playsInline loop preload="none" poster={asset('images/scene-sketch-sm.webp')} className="h-full w-full object-cover" aria-label="Video: the sketch transforms into the finished room" />
            ) : (
              <Img name={s.image} alt={s.alt} w={1344} h={756} className="h-full w-full object-cover" sizes="100vw" />
            )}
          </div>
          <h2 className="display mt-6 text-[clamp(2rem,8vw,3rem)]">
            <span className="eyebrow mb-3 block font-sans text-[0.62rem] text-[var(--accent)]">
              Scene {s.n} — {s.label}
            </span>
            {s.text}
          </h2>
        </article>
      ))}
    </section>
  )
}
