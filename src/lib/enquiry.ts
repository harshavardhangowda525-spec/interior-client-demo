/** Shared between the browser form and the /api/enquiry server function. */

export const projectTypes = [
  'Residential interior',
  'Apartment',
  'Villa / private residence',
  'Commercial interior',
  'Modular kitchen',
  'Space planning',
  '3D interior visualisation',
  'Renovation and styling',
  'Other',
] as const

/** Edit these bands to suit the studio's market and currency. */
export const budgetBands = [
  'Under ₹10 lakh',
  '₹10–25 lakh',
  '₹25–50 lakh',
  '₹50 lakh – ₹1 crore',
  'Above ₹1 crore',
  'Not sure yet',
] as const

export const startWindows = ['Within 1 month', '1–3 months', '3–6 months', '6–12 months', 'Not sure yet'] as const

export type Enquiry = {
  fullName: string
  phone: string
  email: string
  projectType: string
  location: string
  budget: string
  startWindow: string
  details: string
  consent: boolean
}

export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const phoneRe = /^\+?[0-9 ()-]{7,20}$/

export function validateEnquiry(raw: Partial<Record<keyof Enquiry, unknown>>): { data: Enquiry; errors: EnquiryErrors } {
  const s = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  const data: Enquiry = {
    fullName: s(raw.fullName, 120),
    phone: s(raw.phone, 30),
    email: s(raw.email, 160).toLowerCase(),
    projectType: s(raw.projectType, 60),
    location: s(raw.location, 160),
    budget: s(raw.budget, 60),
    startWindow: s(raw.startWindow, 60),
    details: s(raw.details, 2000),
    consent: raw.consent === true,
  }
  const errors: EnquiryErrors = {}
  if (data.fullName.length < 2) errors.fullName = 'Please enter your full name.'
  if (!phoneRe.test(data.phone) || data.phone.replace(/\D/g, '').length < 7) errors.phone = 'Please enter a valid phone number.'
  if (!emailRe.test(data.email)) errors.email = 'Please enter a valid email address.'
  if (!(projectTypes as readonly string[]).includes(data.projectType)) errors.projectType = 'Please choose a project type.'
  if (data.location.length < 2) errors.location = 'Please tell us where the property is.'
  if (!(budgetBands as readonly string[]).includes(data.budget)) errors.budget = 'Please choose an approximate budget.'
  if (!(startWindows as readonly string[]).includes(data.startWindow)) errors.startWindow = 'Please choose when you hope to start.'
  if (!data.consent) errors.consent = 'Please confirm you agree to be contacted about your enquiry.'
  return { data, errors }
}
