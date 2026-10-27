import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Cursor, ScrollRail, WhatsAppButton } from './components/Chrome'
import Home from './pages/Home'

const ProjectPage = lazy(() => import('./pages/ProjectPage'))
const Privacy = lazy(() => import('./pages/Privacy'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <ScrollRail />
      <main id="main">
        <Suspense fallback={<div className="min-h-[100svh] bg-[var(--color-ink)]" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<ProjectPage />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
      <Cursor />
    </BrowserRouter>
  )
}
