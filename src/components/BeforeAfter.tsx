import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { prefersReducedMotion, revealHeading } from '../lib/motion'
import { Img } from './Img'

export function BeforeAfter() {
  const root = useRef<HTMLElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)
  const dragging = useRef(false)

  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    return revealHeading(el.querySelector('h2')!, { after: Array.from(el.querySelectorAll('.ba-fade')) })
  }, [])

  const setFromClientX = useCallback((x: number) => {
    const r = box.current!.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)))
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setFromClientX(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) setFromClientX(e.clientX)
  }
  const onPointerUp = () => {
    dragging.current = false
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2
    const map: Record<string, number> = {
      ArrowLeft: pos - step,
      ArrowDown: pos - step,
      ArrowRight: pos + step,
      ArrowUp: pos + step,
      Home: 0,
      End: 100,
      PageDown: pos - 10,
      PageUp: pos + 10,
    }
    if (e.key in map) {
      e.preventDefault()
      setPos(Math.min(100, Math.max(0, map[e.key])))
    }
  }

  return (
    <section ref={root} id="transformation" className="bg-[var(--color-ivory-2)] py-28 lg:py-40" aria-labelledby="ba-title">
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)]">
        <div className="mb-14 grid gap-6 lg:grid-cols-12">
          <p className="section-num lg:col-span-2">(03) Transformation</p>
          <h2 id="ba-title" className="display text-[clamp(2.6rem,6vw,6.4rem)] lg:col-span-6">
            Before, <em>and after.</em>
          </h2>
          <p className="ba-fade self-end text-[var(--color-muted)] lg:col-span-4">
            Drag the handle — or use the arrow keys — to see an empty shell become a finished living room. Same room,
            same view, same light.
          </p>
        </div>

        <div
          ref={box}
          className="ba ba-fade cursor-ew-resize"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <Img name="scene-finished" alt="After: the finished living room with sofa, leather lounge chairs, walnut panelling and an olive tree" w={1344} h={756} sizes="100vw" />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Img name="scene-empty" alt="Before: the same room empty, with bare plaster walls and stone floor" w={1344} h={756} sizes="100vw" />
          </div>
          <span className="glass absolute left-4 top-4 rounded-full px-4 py-2 text-[0.65rem] font-semibold tracking-[0.25em] text-white" aria-hidden="true">
            BEFORE
          </span>
          <span className="glass absolute right-4 top-4 rounded-full px-4 py-2 text-[0.65rem] font-semibold tracking-[0.25em] text-white" aria-hidden="true">
            AFTER
          </span>
          <div className="ba-handle" style={{ left: `${pos}%` }}>
            <div className="ba-knob glass" aria-hidden="true">
              ‹ ›
            </div>
          </div>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Before and after comparison"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)}% before image shown`}
            onKeyDown={onKeyDown}
            className="absolute top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${pos}%` }}
          />
        </div>
      </div>
    </section>
  )
}
