import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export { gsap, ScrollTrigger, SplitText }

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const isSmallScreen = () => typeof window !== 'undefined' && window.innerWidth < 1024

/**
 * Editorial heading reveal: splits into lines/words and lifts them out of a
 * clipping mask, then fades in any supporting elements after the heading.
 */
export function revealHeading(
  heading: Element,
  options: { trigger?: Element; after?: Element[]; start?: string } = {},
) {
  if (prefersReducedMotion()) return () => {}
  let undo = () => {}
  let cancelled = false
  // Wait for webfonts so SplitText measures the final line breaks.
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    if (!cancelled) undo = splitReveal(heading, options)
  })
  return () => {
    cancelled = true
    undo()
  }
}

function splitReveal(heading: Element, options: { trigger?: Element; after?: Element[]; start?: string }) {
  const split = new SplitText(heading, { type: 'lines,words', linesClass: 'line-mask', mask: 'lines' })
  const tl = gsap.timeline({
    scrollTrigger: { trigger: options.trigger ?? heading, start: options.start ?? 'top 82%', once: true },
  })
  tl.from(split.words, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.045 })
  if (options.after?.length) {
    tl.from(options.after, { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, '-=0.7')
  }
  return () => {
    tl.scrollTrigger?.kill()
    tl.kill()
    split.revert()
  }
}
