import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, hasFinePointer, isSmallScreen, prefersReducedMotion, SplitText } from '../lib/motion'
import { site } from '../config/site'

/** Chair finishes — the Soda "flavours", re-imagined as material pairings. */
const finishes = [
  {
    id: 'walnut-linen',
    label: 'Walnut',
    sub: 'Oat linen',
    wood: '/textures/walnut.jpg',
    woodTint: '#ffffff',
    fabric: '#a8927a',
    metal: '#7d5e3f',
    bg: { inner: '#7a5a40', mid: '#2e221a', outer: '#0f0c0a' },
    tiles: ['walnut', 'linen', 'travertine', 'metal', 'marble', 'plaster'],
  },
  {
    id: 'oak-ivory',
    label: 'White Oak',
    sub: 'Ivory bouclé',
    wood: '/textures/oak.jpg',
    woodTint: '#ffffff',
    fabric: '#e9e1d2',
    metal: '#a88a62',
    bg: { inner: '#94805f', mid: '#3b3127', outer: '#13100d' },
    tiles: ['oak', 'plaster', 'marble', 'linen', 'travertine', 'metal'],
  },
  {
    id: 'smoked-taupe',
    label: 'Smoked Oak',
    sub: 'Taupe velvet',
    wood: '/textures/oak.jpg',
    woodTint: '#5b4a3c',
    fabric: '#6f5f55',
    metal: '#3a3633',
    bg: { inner: '#56605b', mid: '#20262a', outer: '#0a0c0d' },
    tiles: ['marble', 'metal', 'walnut', 'travertine', 'plaster', 'oak'],
  },
] as const

type Finish = (typeof finishes)[number]

const TILE_LAYOUT = [
  // foreground
  { top: 18, left: 33, size: 92, layer: 'fg' },
  { top: 68, left: 41, size: 62, layer: 'fg' },
  { top: 46, left: 62, size: 108, layer: 'fg' },
  { top: 11, left: 51, size: 54, layer: 'fg' },
  { top: 80, left: 58, size: 72, layer: 'fg' },
  { top: 58, left: 72, size: 80, layer: 'fg' },
  // background
  { top: 15, left: 43, size: 40, layer: 'bg' },
  { top: 52, left: 56, size: 36, layer: 'bg' },
  { top: 84, left: 33, size: 44, layer: 'bg' },
] as const

type MVMaterial = {
  name: string
  isLoaded?: boolean
  setBaseColorFactor?: (c: string | number[]) => void
  pbrMetallicRoughness: {
    setBaseColorFactor: (c: string | number[]) => void
    baseColorTexture: {
      texture: { sampler?: { setScale?: (s: { u: number; v: number }) => void } } | null
      setTexture: (t: unknown) => void
    } | null
  }
}
type MVElement = HTMLElement & {
  cameraOrbit: string
  model?: { materials: MVMaterial[] }
  createTexture: (uri: string) => Promise<unknown>
}

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const mv = useRef<MVElement | null>(null)
  const textures = useRef<Record<string, unknown>>({})
  const [active, setActive] = useState(0)
  const [modelReady, setModelReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [motionOk] = useState(() => !prefersReducedMotion())
  const state = useRef({ switching: false, spin: 0, visible: true })

  // Lazy-load the <model-viewer> web component after first paint.
  useEffect(() => {
    let cancelled = false
    const load = () => import('@google/model-viewer').then(() => !cancelled && setModelReady(true))
    const idle = typeof window.requestIdleCallback === 'function'
    const id = idle ? window.requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 400)
    return () => {
      cancelled = true
      if (idle) window.cancelIdleCallback(id as number)
      else clearTimeout(id)
    }
  }, [])

  // Hero copy entrance — short, never blocks interaction.
  useLayoutEffect(() => {
    if (!motionOk || !root.current) return
    const ctx = gsap.context(() => {
      gsap.set('.hero-title', { autoAlpha: 0 })
      gsap.from('.hero-fade', { y: 22, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.55 })
    }, root)
    // Split only once the webfont is in, so line breaks are measured correctly.
    let cancelled = false
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(() => {
      if (cancelled) return
      ctx.add(() => {
        const split = new SplitText('.hero-title', { type: 'words', mask: 'words' })
        gsap.set('.hero-title', { autoAlpha: 1 })
        gsap.from(split.words, { yPercent: 115, duration: 1.15, ease: 'expo.out', stagger: 0.07 })
      })
    })
    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [motionOk])

  // Video: pause when off-screen, fall back to the poster if playback is refused.
  useEffect(() => {
    const el = root.current
    const video = el?.querySelector('video')
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      state.current.visible = entry.isIntersecting
      if (!video) return
      if (entry.isIntersecting) video.play().catch(() => setVideoFailed(true))
      else video.pause()
    })
    io.observe(el)
    return () => io.disconnect()
  }, [videoFailed])

  // Model setup: preload textures and apply the default finish.
  useEffect(() => {
    const el = mv.current
    if (!modelReady || !el) return
    const onLoad = async () => {
      try {
        for (const src of new Set(finishes.map((f) => f.wood))) {
          textures.current[src] = await el.createTexture(src)
        }
        applyFinish(el, finishes[active], textures.current)
      } catch (e) {
        console.warn('Chair texture preload failed', e)
      }
    }
    el.addEventListener('load', onLoad)
    return () => el.removeEventListener('load', onLoad)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelReady])

  // Pointer tilt, parallax, tile repulsion and floating — one rAF loop.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const fg = el.querySelector<HTMLElement>('.swatch-layer.fg')!
    const bg = el.querySelector<HTMLElement>('.swatch-layer.bg')!
    const tiles = Array.from(el.querySelectorAll<HTMLElement>('.swatch-tile'))
    tiles.forEach((t) => {
      t.dataset.rx = '0'
      t.dataset.ry = '0'
      t.dataset.angle = String(Math.random() * 40 - 20)
      t.dataset.baseX = '0'
      t.dataset.baseY = '0'
    })
    const mouse = { x: 0, y: 0, px: -9999, py: -9999 }
    const cur = { x: 0, y: 0 }
    const fine = hasFinePointer()
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5
      mouse.y = e.clientY / window.innerHeight - 0.5
      mouse.px = e.clientX
      mouse.py = e.clientY
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!state.current.visible) return
      const time = performance.now() * 0.001
      cur.x += (mouse.x - cur.x) * 0.05
      cur.y += (mouse.y - cur.y) * 0.05
      if (mv.current && 'cameraOrbit' in mv.current) {
        mv.current.cameraOrbit = `${-32 + cur.x * 40 + state.current.spin}deg ${76 + cur.y * 16}deg 105%`
      }
      if (!motionOk) return
      fg.style.transform = `translate(${cur.x * 60}px, ${cur.y * 60}px)`
      bg.style.transform = `translate(${cur.x * -30}px, ${cur.y * -30}px)`
      if (state.current.switching) return
      tiles.forEach((tile, i) => {
        let rx = parseFloat(tile.dataset.rx!)
        let ry = parseFloat(tile.dataset.ry!)
        let angle = parseFloat(tile.dataset.angle!)
        const baseX = parseFloat(tile.dataset.baseX!)
        const baseY = parseFloat(tile.dataset.baseY!)
        let targetRx = 0
        let targetRy = 0
        let speed = 1
        if (fine) {
          const r = tile.getBoundingClientRect()
          const dx = mouse.px - (r.left + r.width / 2)
          const dy = mouse.py - (r.top + r.height / 2)
          const dist = Math.hypot(dx, dy)
          if (dist < 340 && dist > 0) {
            const force = (340 - dist) / 340
            targetRx = (dx / dist) * force * -80
            targetRy = (dy / dist) * force * -80
            speed = 1 + force * 4
          }
        }
        rx += (targetRx - rx) * 0.1
        ry += (targetRy - ry) * 0.1
        angle += 0.04 * speed
        tile.dataset.rx = String(rx)
        tile.dataset.ry = String(ry)
        tile.dataset.angle = String(angle)
        const dur = [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10][i % 9]
        const phase = (time + i * 0.7) * ((Math.PI * 2) / dur)
        tile.style.transform = `translate(${rx + baseX}px, ${ry + baseY + Math.sin(phase) * 12}px) rotate(${angle + Math.cos(phase) * 5}deg)`
      })
    }
    tick()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [motionOk])

  // Light motes rising through the room (the Soda bubbles, made architectural).
  useEffect(() => {
    if (!motionOk || isSmallScreen()) return
    const layer = root.current?.querySelector<HTMLElement>('.mote-layer')
    if (!layer) return
    const id = window.setInterval(() => {
      if (!state.current.visible || document.hidden) return
      const m = document.createElement('span')
      const size = Math.random() * 6 + 3
      const dur = Math.random() * 8 + 9
      m.className = 'mote'
      m.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;--o:${(Math.random() * 0.35 + 0.15).toFixed(2)};animation-duration:${dur}s`
      layer.appendChild(m)
      window.setTimeout(() => m.remove(), dur * 1000)
    }, 650)
    return () => clearInterval(id)
  }, [motionOk])

  const choose = (index: number) => {
    if (state.current.switching || index === active) return
    const finish = finishes[index]
    setActive(index)
    const el = root.current!
    const reduced = !motionOk

    gsap.to(document.documentElement, {
      '--bg-inner': finish.bg.inner,
      '--bg-mid': finish.bg.mid,
      '--bg-outer': finish.bg.outer,
      duration: reduced ? 0 : 1.5,
      ease: 'power2.inOut',
    })
    if (reduced) {
      if (mv.current) applyFinish(mv.current, finish, textures.current)
      updateTiles(el, finish)
      return
    }
    state.current.switching = true

    // Chair: spin 360° into a motion blur, swap texture at the peak, settle at 720°.
    const spin = { val: 0, blur: 0 }
    const model = mv.current
    gsap.to(spin, {
      val: 360,
      blur: 12,
      duration: 0.6,
      ease: 'power2.in',
      onUpdate: () => {
        state.current.spin = spin.val
        if (model) model.style.filter = `blur(${spin.blur}px)`
      },
      onComplete: () => {
        try {
          if (model) applyFinish(model, finish, textures.current)
        } catch (e) {
          console.warn('Finish swap failed', e)
        }
        gsap.to(spin, {
          val: 720,
          blur: 0,
          duration: 1.5,
          ease: 'back.out(0.7)',
          onUpdate: () => {
            state.current.spin = spin.val
            if (model) model.style.filter = `blur(${spin.blur}px)`
          },
          onComplete: () => {
            state.current.spin = 0
            if (model) model.style.filter = 'none'
          },
        })
      },
    })

    // Tiles implode to the centre, swap material, then burst out to new positions.
    const tiles = Array.from(el.querySelectorAll<HTMLElement>('.swatch-tile'))
    let done = 0
    tiles.forEach((tile) => {
      const startAngle = parseFloat(tile.dataset.angle || '0')
      const toCenterX = window.innerWidth / 2 - tile.offsetLeft - tile.offsetWidth / 2
      const toCenterY = window.innerHeight / 2 - tile.offsetTop - tile.offsetHeight / 2
      const nextX = (Math.random() - 0.5) * 200
      const nextY = (Math.random() - 0.5) * 200
      gsap.set(tile, {
        rotation: startAngle,
        x: parseFloat(tile.dataset.baseX || '0'),
        y: parseFloat(tile.dataset.baseY || '0'),
      })
      gsap
        .timeline()
        .to(tile, {
          x: toCenterX,
          y: toCenterY,
          rotation: startAngle + 45,
          scale: 0.1,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => updateTiles(el, finish, tile),
        })
        .to(tile, { duration: 0.3 })
        .to(tile, {
          x: nextX,
          y: nextY,
          rotation: startAngle + 90,
          scale: 1,
          opacity: 1,
          duration: 0.9,
          ease: 'back.out(1.5)',
          onComplete: () => {
            tile.dataset.angle = String(startAngle + 90)
            tile.dataset.baseX = String(nextX)
            tile.dataset.baseY = String(nextY)
            tile.dataset.rx = '0'
            tile.dataset.ry = '0'
            if (++done === tiles.length) state.current.switching = false
          },
        })
    })
  }

  const finish = finishes[active]

  return (
    <section ref={root} id="home" className="hero grain on-dark" aria-label="Introduction">
      <div className="hero-media" aria-hidden="true">
        <div className="zoom">
          {videoFailed ? (
            <img src="/images/hero-poster.webp" alt="" />
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/hero-poster.webp"
              onError={() => setVideoFailed(true)}
            >
              <source src="/video/hero-1280.webm" type="video/webm" />
              <source src="/video/hero-1280.mp4" type="video/mp4" />
            </video>
          )}
        </div>
      </div>
      <div className="hero-tint" aria-hidden="true" />
      <div className="mote-layer absolute inset-0 pointer-events-none -z-[1] overflow-hidden" aria-hidden="true" />

      <div className="swatch-layer bg z-0" aria-hidden="true">
        {TILE_LAYOUT.map((t, i) =>
          t.layer === 'bg' ? <Tile key={i} i={i} t={t} finish={finish} /> : null,
        )}
      </div>

      <div className="chair-stage">
        {modelReady && (
          <model-viewer
            ref={(node: HTMLElement | null) => {
              mv.current = node as MVElement | null
            }}
            src="/models/lounge-chair.glb"
            alt="3D lounge chair in the selected wood and fabric finish"
            camera-orbit="-32deg 76deg 105%"
            field-of-view="28deg"
            environment-image="neutral"
            exposure="1.15"
            shadow-intensity="0.9"
            shadow-softness="1"
            interaction-prompt="none"
            disable-zoom
            loading="eager"
          />
        )}
      </div>

      <div className="swatch-layer fg z-[3] hidden sm:block" aria-hidden="true">
        {TILE_LAYOUT.map((t, i) =>
          t.layer === 'fg' ? <Tile key={i} i={i} t={t} finish={finish} /> : null,
        )}
      </div>

      <div className="relative z-[4] mx-auto flex min-h-[100svh] max-w-[1600px] flex-col justify-between px-[var(--gutter)] pb-10 pt-32 lg:flex-row lg:items-stretch lg:pb-12">
        <div className="flex max-w-[44rem] flex-col gap-7 lg:py-6">
          <p className="eyebrow hero-fade text-white/70">Lumora Interiors · Architecture & Interiors</p>
          <h1 className="hero-title display text-white">
            Spaces That <em>Tell</em> Your Story.
          </h1>
          <p className="hero-fade max-w-[27rem] text-[1.05rem] leading-relaxed text-white/75">
            We design timeless interiors where architecture, craftsmanship, and everyday living come together.
          </p>
          <div className="hero-fade flex flex-wrap items-center gap-3">
            <a href="#projects" className="pill-btn pill-dark">
              Explore our work <span className="plus" aria-hidden="true">+</span>
            </a>
            <a href="#contact" className="pill-btn pill-ghost">
              Book a consultation
            </a>
          </div>
          <div className="hero-fade mt-auto hidden items-center gap-4 lg:flex">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-white/5" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M3 21V9l9-6 9 6v12" />
                <path d="M9 21v-7h6v7" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.65rem] tracking-[0.2em] text-white/60">CONCEPT DEMONSTRATION</span>
              <span className="text-sm font-semibold">by {site.builtBy.name}</span>
            </div>
          </div>
        </div>

        <div className="mt-[46vh] flex flex-col items-start gap-6 lg:mt-0 lg:w-[440px] lg:items-end lg:justify-between lg:py-6 lg:text-right">
          <div className="hero-fade flex flex-col gap-4 lg:items-end">
            <p className="eyebrow text-white/60" id="finish-label">
              Choose a finish
            </p>
            <div className="flex gap-3" role="group" aria-labelledby="finish-label">
              {finishes.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  className="mat-card"
                  aria-pressed={i === active}
                  onClick={() => choose(i)}
                >
                  <span className="chips" aria-hidden="true">
                    <span style={{ backgroundImage: `url(${f.wood})`, backgroundColor: f.woodTint, backgroundBlendMode: 'multiply' }} />
                    <span style={{ backgroundImage: 'url(/textures/linen.jpg)', backgroundColor: f.fabric, backgroundBlendMode: 'multiply' }} />
                  </span>
                  <span className="block text-[0.72rem] font-semibold">{f.label}</span>
                  <span className="block text-[0.68rem] text-white/60">{f.sub}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:bg-white/10"
                onClick={() => choose((active + finishes.length - 1) % finishes.length)}
                aria-label="Previous finish"
              >
                ←
              </button>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:bg-white/10"
                onClick={() => choose((active + 1) % finishes.length)}
                aria-label="Next finish"
              >
                →
              </button>
            </div>
            <p className="sr-only" aria-live="polite">
              {finish.label} with {finish.sub} selected
            </p>
          </div>
          <p className="display hero-fade mb-10 hidden text-[clamp(2.6rem,4.4vw,5rem)] text-white lg:block" aria-hidden="true">
            <em>Crafted</em>
            <br />
            to be lived in
          </p>
        </div>
      </div>

      <a
        href="#sequence"
        className="absolute bottom-6 left-1/2 z-[5] hidden -translate-x-1/2 flex-col items-center gap-3 text-white/70 no-underline md:flex"
        aria-label="Scroll to discover"
      >
        <span className="eyebrow text-[0.6rem]">Scroll</span>
        <span className="scroll-cue" />
      </a>
    </section>
  )
}

function Tile({ i, t, finish }: { i: number; t: (typeof TILE_LAYOUT)[number]; finish: Finish }) {
  const tex = finish.tiles[i % finish.tiles.length]
  return (
    <div
      className="swatch-tile absolute"
      data-index={i}
      style={{ top: `${t.top}%`, left: `${t.left}%`, width: t.size, height: t.size, opacity: t.layer === 'bg' ? 0.6 : 1 }}
    >
      <div
        className="swatch h-full w-full"
        style={{
          backgroundImage: `url(/textures/${tex}.jpg)`,
          transform: `perspective(500px) rotateX(${(i * 23) % 40 - 20}deg) rotateY(${(i * 37) % 50 - 25}deg)`,
        }}
      />
    </div>
  )
}

function updateTiles(root: HTMLElement, finish: Finish, only?: HTMLElement) {
  const tiles = only ? [only] : Array.from(root.querySelectorAll<HTMLElement>('.swatch-tile'))
  tiles.forEach((tile) => {
    const i = Number(tile.dataset.index)
    const face = tile.firstElementChild as HTMLElement
    face.style.backgroundImage = `url(/textures/${finish.tiles[(i + 1) % finish.tiles.length]}.jpg)`
  })
}

function applyFinish(el: MVElement, finish: Finish, textures: Record<string, unknown>) {
  const mats = el.model?.materials ?? []
  for (const m of mats) {
    // Inactive KHR_materials_variants materials are not loaded — skip them.
    if (m.isLoaded === false) continue
    const pbr = m.pbrMetallicRoughness
    const name = m.name.toLowerCase()
    if (name.startsWith('wood')) {
      const tex = textures[finish.wood]
      if (tex && pbr.baseColorTexture) {
        pbr.baseColorTexture.setTexture(tex)
        pbr.baseColorTexture.texture?.sampler?.setScale?.({ u: 3, v: 3 })
      }
      pbr.setBaseColorFactor(finish.woodTint)
    } else if (name.startsWith('fabric')) {
      pbr.setBaseColorFactor(finish.fabric)
    } else if (name.startsWith('metal')) {
      pbr.setBaseColorFactor(finish.metal)
    }
  }
}
