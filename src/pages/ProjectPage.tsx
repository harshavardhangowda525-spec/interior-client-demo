import { useLayoutEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProject, projects } from '../data/projects'
import { Img } from '../components/Img'
import { useDocumentMeta } from '../lib/seo'
import { gsap, prefersReducedMotion, revealHeading } from '../lib/motion'
import NotFound from './NotFound'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = getProject(slug)
  const root = useRef<HTMLElement>(null)

  useDocumentMeta({
    title: project ? `${project.title} — Lumora Interiors` : 'Project not found — Lumora Interiors',
    description: project?.summary ?? 'This project could not be found.',
    path: project ? `/projects/${project.slug}` : '/404',
    image: project ? `/images/${project.image}.webp` : undefined,
  })

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const undo = revealHeading(el.querySelector('h1')!, { after: Array.from(el.querySelectorAll('.pp-fade')), start: 'top 100%' })
    const ctx = gsap.context(() => {
      gsap.fromTo('.pp-hero img', { scale: 1.12 }, { scale: 1, duration: 1.8, ease: 'expo.out' })
      gsap.fromTo('.pp-hero img', { yPercent: 0 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.pp-hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.fromTo('.pp-detail', { clipPath: 'inset(20% 20% 20% 20%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.pp-detail', start: 'top 90%', end: 'top 40%', scrub: 0.8 } })
    }, el)
    return () => {
      undo()
      ctx.revert()
    }
  }, [slug])

  if (!project) return <NotFound />
  const i = projects.indexOf(project)
  const next = projects[(i + 1) % projects.length]

  return (
    <article ref={root} key={project.slug}>
      <header className="page-hero pp-hero on-dark relative h-[88svh] min-h-[520px] overflow-hidden bg-[var(--color-ink)] text-white">
        <Img name={project.image} alt={project.alt} priority className="absolute inset-0 h-full w-full object-cover" style={{ viewTransitionName: `proj-${project.slug}` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-[var(--gutter)] pb-12">
          <p className="pp-fade eyebrow mb-4 text-white/75">
            Project {project.index} · {project.category}
          </p>
          <h1 className="display text-[clamp(3rem,8vw,8.5rem)]">{project.title}</h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-14 px-[var(--gutter)] py-20 lg:grid-cols-12 lg:py-28">
        <dl className="pp-fade grid grid-cols-2 gap-6 self-start text-sm lg:col-span-3 lg:grid-cols-1">
          <div>
            <dt className="eyebrow text-[var(--color-muted)]">Category</dt>
            <dd className="mt-1">{project.category}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[var(--color-muted)]">Location</dt>
            <dd className="mt-1">{project.location}</dd>
          </div>
          <div>
            <dt className="eyebrow text-[var(--color-muted)]">Status</dt>
            <dd className="mt-1">{project.year} — demonstration</dd>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <dt className="eyebrow mb-3 text-[var(--color-muted)]">Material palette</dt>
            <dd className="flex flex-col gap-2">
              {project.palette.map((c) => (
                <span key={c.name} className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full border border-black/10" style={{ background: c.hex }} aria-hidden="true" />
                  {c.name}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <div className="lg:col-span-6 lg:col-start-5">
          <p className="pp-fade display text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.15]">{project.summary}</p>
          {project.story.map((s) => (
            <p key={s} className="pp-fade mt-6 max-w-xl text-[var(--color-muted)]">
              {s}
            </p>
          ))}
          <p className="pp-fade mt-8 text-xs text-[var(--color-muted)]/80">
            Concept study with AI-generated imagery, created to demonstrate the website. Not a completed commission.
          </p>
          <Link to={`/?project=${project.slug}#contact`} viewTransition className="pp-fade pill-btn pill-ink mt-10">
            Enquire about a similar project <span className="plus" aria-hidden="true">+</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-24">
        <div className="pp-detail mx-auto aspect-[4/5] max-w-3xl overflow-hidden rounded-[4px] md:aspect-[3/4]">
          <Img name={project.detail} alt={project.detailAlt} w={1024} h={1024} sizes="(min-width: 768px) 48rem, 100vw" className="h-full w-full object-cover" />
        </div>
      </div>

      <nav aria-label="Next project" className="on-dark bg-[var(--color-charcoal)] text-white">
        <Link to={`/projects/${next.slug}`} viewTransition className="group mx-auto flex max-w-[1600px] flex-col gap-6 px-[var(--gutter)] py-20 text-white no-underline md:flex-row md:items-center md:justify-between">
          <span>
            <span className="eyebrow block text-white/50">Next project</span>
            <span className="display mt-3 block text-[clamp(2.4rem,5vw,5rem)] transition-colors group-hover:text-[var(--color-sand)]">{next.title}</span>
          </span>
          <span className="h-40 w-full overflow-hidden rounded-[4px] md:w-72">
            <Img name={next.image} alt="" sizes="18rem" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          </span>
        </Link>
      </nav>
    </article>
  )
}
