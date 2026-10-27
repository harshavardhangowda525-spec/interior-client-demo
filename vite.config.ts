import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { projects } from './src/data/projects'

/** Injects JSON-LD and emits sitemap.xml + robots.txt for the configured domain. */
function seo(siteUrl: string, base: string): Plugin {
  const url = siteUrl.replace(/\/$/, '')
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'InteriorDesigner',
    name: 'LUMORA INTERIORS',
    url,
    image: `${url}/og-image.jpg`,
    description:
      'Lumora Interiors designs timeless residential and commercial interiors where architecture, craftsmanship and everyday living come together.',
  }
  return {
    name: 'lumora-seo',
    transformIndexHtml: (html) => html.replace('%LD_JSON%', JSON.stringify(ld)).replaceAll('%SITE_URL%', url).replaceAll('%BASE%', base),
    generateBundle() {
      const paths = ['/', ...projects.map((p) => `/projects/${p.slug}`), '/privacy']
      const sitemap =
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        paths.map((p) => `  <url><loc>${url}${p}</loc></url>`).join('\n') +
        '\n</urlset>\n'
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n` })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.VITE_SITE_URL || 'https://example.com'
  // Sub-path deploys (e.g. GitHub Pages project sites) set BASE_PATH=/repo-name/
  const base = env.BASE_PATH || '/'
  return {
    base,
    plugins: [react(), tailwindcss(), seo(siteUrl, base)],
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText'],
          },
        },
      },
    },
  }
})
