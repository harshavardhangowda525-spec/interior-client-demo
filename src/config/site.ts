/**
 * LUMORA INTERIORS — single source of truth for business details.
 *
 * Everything a real studio needs to change lives here or in environment
 * variables (see .env.example). Nothing in this file is a verified claim:
 * fields left empty are hidden from the published site.
 */

const env = import.meta.env

export const site = {
  name: 'LUMORA INTERIORS',
  shortName: 'Lumora',
  tagline: 'Spaces That Tell Your Story.',
  description:
    'Lumora Interiors designs timeless residential and commercial interiors where architecture, craftsmanship and everyday living come together.',

  /** Canonical origin, e.g. https://www.lumorainteriors.com — no trailing slash. */
  url: (env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://example.com',

  /**
   * WhatsApp business number in international format, digits only
   * (e.g. 919800000000). Set VITE_WHATSAPP_NUMBER. Left empty on purpose:
   * no real number is invented for this demo.
   */
  whatsappNumber: ((env.VITE_WHATSAPP_NUMBER as string | undefined) || '').replace(/\D/g, ''),
  whatsappMessage:
    "Hello Lumora Interiors, I'd like to discuss an interior design consultation for my project.",

  /** Public contact details. Empty strings are not rendered. */
  contact: {
    email: (env.VITE_CONTACT_EMAIL as string | undefined) || '',
    phone: (env.VITE_CONTACT_PHONE as string | undefined) || '',
    instagram: (env.VITE_INSTAGRAM_URL as string | undefined) || '',
  },

  /** Local SEO — fill in with the studio's real, verifiable details. */
  address: {
    streetAddress: '',
    locality: '',
    region: '',
    postalCode: '',
    country: '',
  },
  serviceArea: '' as string,
  openingHours: '' as string, // schema.org format, e.g. "Mo-Sa 10:00-19:00"

  /** Enquiry endpoint. Defaults to the bundled Vercel function. */
  enquiryEndpoint: (env.VITE_ENQUIRY_ENDPOINT as string | undefined) || '/api/enquiry',

  /** Credit for this concept build. */
  builtBy: { name: 'Infinity Web & Apps', url: '' },
}

/**
 * Trust content. Only add entries the studio can verify — the published site
 * renders a section only when it has real entries.
 */
export const trust = {
  /** Set true once genuine client testimonials replace the demonstration copy. */
  testimonialsAreVerified: false,
  stats: [] as { value: string; label: string }[],
  credentials: [] as string[],
  memberships: [] as string[],
  media: [] as { name: string; url?: string }[],
}

export const whatsappLink = (message = site.whatsappMessage) =>
  site.whatsappNumber
    ? `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`
    : ''
