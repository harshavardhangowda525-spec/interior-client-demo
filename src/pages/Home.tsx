import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { ScrollSequence } from '../components/ScrollSequence'
import { Projects } from '../components/Projects'
import { BeforeAfter } from '../components/BeforeAfter'
import { Services } from '../components/Services'
import { Materials } from '../components/Materials'
import { Studio, Trust } from '../components/Studio'
import { Consultation } from '../components/Consultation'
import { site } from '../config/site'
import { businessSchema, useDocumentMeta } from '../lib/seo'
import { ScrollTrigger } from '../lib/motion'

export default function Home() {
  const { hash } = useLocation()
  useDocumentMeta({
    title: 'Lumora Interiors — Luxury Interior Design & Architecture Studio',
    description: site.description,
    path: '/',
  })

  // Full structured data, including any local-SEO fields filled in site config.
  useEffect(() => {
    const el = document.getElementById('ld-business')
    if (el) el.textContent = JSON.stringify(businessSchema())
  }, [])

  // Arriving from another page with a #section: wait for pinned layouts, then scroll.
  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    const t = window.setTimeout(() => {
      ScrollTrigger.refresh()
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto' })
    }, 120)
    return () => clearTimeout(t)
  }, [hash])

  return (
    <>
      <Hero />
      <ScrollSequence />
      <Projects />
      <BeforeAfter />
      <Services />
      <Materials />
      <Studio />
      <Trust />
      <Consultation />
    </>
  )
}
