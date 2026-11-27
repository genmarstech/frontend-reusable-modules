import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Public pages that should appear in search results.
const PUBLIC_PAGES = ['/', '/features', '/solutions', '/how-it-works', '/about', '/terms', '/privacy']

/**
 * Fills in the site address (VITE_SITE_URL, default https://getvelora.co.ke) in index.html,
 * and writes robots.txt and sitemap.xml for it at build time, so changing domain is one setting.
 */
function siteUrl(url: string): Plugin {
  return {
    name: 'velora-site-url',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', url),
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: [
          'User-agent: *',
          'Allow: /',
          // Signed-in areas and personal booking links stay out of search results.
          'Disallow: /dashboard/',
          'Disallow: /businesses',
          'Disallow: /onboarding/',
          'Disallow: /manage/',
          '',
          `Sitemap: ${url}/sitemap.xml`,
          '',
        ].join('\n'),
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          PUBLIC_PAGES.map((path) => `  <url><loc>${url}${path === '/' ? '/' : path}</loc></url>`).join('\n') +
          '\n</urlset>\n',
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const url = (env.VITE_SITE_URL || 'https://getvelora.co.ke').replace(/\/+$/, '')
  return {
    plugins: [react(), tailwindcss(), siteUrl(url)],
  }
})
