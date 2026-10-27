import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../lib/seo'

export default function NotFound() {
  useDocumentMeta({ title: 'Page not found — Lumora Interiors', description: 'This page could not be found.', path: '/404' })
  return (
    <section className="on-dark flex min-h-[100svh] flex-col items-start justify-center gap-8 bg-[var(--color-ink)] px-[var(--gutter)] text-white">
      <p className="section-num !text-[var(--color-sand)]">404</p>
      <h1 className="display text-[clamp(3rem,8vw,7rem)]">
        This room <em>doesn’t exist.</em>
      </h1>
      <Link to="/" viewTransition className="pill-btn pill-dark border border-white/15">
        Return home <span className="plus" aria-hidden="true">+</span>
      </Link>
    </section>
  )
}
