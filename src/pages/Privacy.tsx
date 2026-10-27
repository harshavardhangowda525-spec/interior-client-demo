import { useLayoutEffect } from 'react'
import { site } from '../config/site'
import { useDocumentMeta } from '../lib/seo'

export default function Privacy() {
  useDocumentMeta({
    title: 'Privacy Policy — Lumora Interiors',
    description: 'How Lumora Interiors collects, uses and protects the information you share through this website.',
    path: '/privacy',
  })
  useLayoutEffect(() => window.scrollTo(0, 0), [])

  return (
    <article className="mx-auto max-w-3xl px-[var(--gutter)] pb-28 pt-40">
      <p className="section-num mb-4">Legal</p>
      <h1 className="display text-[clamp(2.8rem,6vw,5rem)]">Privacy policy</h1>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        Template for review — the studio should confirm this text with its own legal adviser before publishing.
      </p>
      <div className="mt-12 flex flex-col gap-8 leading-relaxed text-[var(--color-charcoal)]/85 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:text-[var(--color-charcoal)]">
        <section>
          <h2>What we collect</h2>
          <p className="mt-3">
            When you send a consultation enquiry we collect your name, phone number, email address, project type,
            property location, approximate budget, expected start and any details you choose to share. To protect
            the form from abuse we also store a one-way hash of your network address and your browser’s user agent.
          </p>
        </section>
        <section>
          <h2>How we use it</h2>
          <p className="mt-3">
            We use your details only to respond to your enquiry and discuss your project. We do not sell your data or
            use it for unrelated marketing without your permission.
          </p>
        </section>
        <section>
          <h2>Where it is stored</h2>
          <p className="mt-3">
            Enquiries are stored securely in a managed database accessible only to the studio. If you contact us via
            WhatsApp, your conversation is also subject to WhatsApp’s own privacy policy.
          </p>
        </section>
        <section>
          <h2>How long we keep it</h2>
          <p className="mt-3">
            We keep enquiry records for as long as needed to respond and manage any resulting project, after which
            they are deleted.
          </p>
        </section>
        <section>
          <h2>Your rights</h2>
          <p className="mt-3">
            You can ask to see, correct or delete the information we hold about you at any time
            {site.contact.email ? (
              <>
                {' '}by emailing <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              </>
            ) : (
              ' by contacting the studio'
            )}
            .
          </p>
        </section>
        <section>
          <h2>Cookies</h2>
          <p className="mt-3">This website does not use advertising or tracking cookies.</p>
        </section>
      </div>
    </article>
  )
}
