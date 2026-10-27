import { useEffect } from 'react'
import { site } from '../config/site'

type Meta = { title: string; description: string; path: string; image?: string }

function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

/** Keeps title, description, canonical and Open Graph tags in sync per route. */
export function useDocumentMeta({ title, description, path, image = '/og-image.jpg' }: Meta) {
  useEffect(() => {
    const url = site.url + path
    const img = image.startsWith('http') ? image : site.url + image
    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    setMeta('meta[property="og:image"]', 'property', 'og:image', img)
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', img)
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [title, description, path, image])
}

/** schema.org data — only includes address/contact fields the studio has filled in. */
export function businessSchema() {
  const a = site.address
  const hasAddress = Object.values(a).some(Boolean)
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'InteriorDesigner',
    name: site.name,
    description: site.description,
    url: site.url,
    image: site.url + '/og-image.jpg',
  }
  if (hasAddress)
    data.address = {
      '@type': 'PostalAddress',
      streetAddress: a.streetAddress,
      addressLocality: a.locality,
      addressRegion: a.region,
      postalCode: a.postalCode,
      addressCountry: a.country,
    }
  if (site.contact.phone) data.telephone = site.contact.phone
  if (site.contact.email) data.email = site.contact.email
  if (site.serviceArea) data.areaServed = site.serviceArea
  if (site.openingHours) data.openingHours = site.openingHours
  if (site.contact.instagram) data.sameAs = [site.contact.instagram]
  return data
}
