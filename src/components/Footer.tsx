import { Link, useLocation } from 'react-router-dom'
import { site, whatsappLink } from '../config/site'
import { sections } from '../data/nav'

export function Footer() {
  const { pathname } = useLocation()
  const href = (id: string) => (pathname === '/' ? `#${id}` : `${import.meta.env.BASE_URL}#${id}`)
  const wa = whatsappLink()
  const year = new Date().getFullYear()

  return (
    <footer className="on-dark relative overflow-hidden bg-[var(--color-ink)] text-[var(--color-ivory)]">
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-10 pt-24">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="display text-[clamp(3rem,9vw,8.5rem)] leading-[0.85]">
              Lumora<br />
              <em className="text-[var(--color-sand)]">Interiors</em>
            </p>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-white/60">
              An interior design and architecture studio creating timeless homes and workplaces — calm, crafted and
              shaped around the people who use them.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <p className="eyebrow mb-5 text-white/40">Explore</p>
            <ul className="flex flex-col gap-2.5 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={href(s.id)} className="text-white/80 no-underline transition-colors hover:text-[var(--color-sand)]">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <p className="eyebrow mb-5 text-white/40">Contact</p>
            <ul className="flex flex-col gap-2.5 text-sm">
              {site.contact.email && (
                <li>
                  <a href={`mailto:${site.contact.email}`} className="text-white/80 no-underline hover:text-[var(--color-sand)]">
                    {site.contact.email}
                  </a>
                </li>
              )}
              {site.contact.phone && (
                <li>
                  <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="text-white/80 no-underline hover:text-[var(--color-sand)]">
                    {site.contact.phone}
                  </a>
                </li>
              )}
              <li>
                {wa ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="text-white/80 no-underline hover:text-[var(--color-sand)]">
                    WhatsApp enquiry ↗
                  </a>
                ) : (
                  <span className="text-white/40">WhatsApp — number to be configured</span>
                )}
              </li>
              <li>
                {site.contact.instagram ? (
                  <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer" className="text-white/80 no-underline hover:text-[var(--color-sand)]">
                    Instagram ↗
                  </a>
                ) : (
                  <span className="text-white/40">Instagram — link to be configured</span>
                )}
              </li>
              {!site.contact.email && !site.contact.phone && (
                <li className="text-white/40">Studio email and phone to be configured</li>
              )}
            </ul>
            <a href={href('contact')} className="pill-btn pill-dark mt-8 border border-white/15">
              Start a project <span className="plus" aria-hidden="true">+</span>
            </a>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/45 md:flex-row md:items-center md:justify-between">
          <p>© {year} Lumora Interiors. All rights reserved.</p>
          <p>
            Concept website by {site.builtBy.name}. Imagery is AI-generated for demonstration. 3D chair: Khronos glTF
            sample (CC0).
          </p>
          <Link to="/privacy" viewTransition className="text-white/60 no-underline hover:text-[var(--color-sand)]">
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
