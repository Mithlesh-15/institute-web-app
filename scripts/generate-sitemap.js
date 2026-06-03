import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = 'https://rtcdurg.vercel.app'

const publicRoutes = [
  '',
  '/timetable',
  '/about',
  '/contact',
  '/maths-tuition-durg',
  '/physics-tuition-durg',
  '/chemistry-tuition-durg',
  '/biology-tuition-durg',
  '/english-tuition-durg',
  '/commerce-tuition-durg',
  '/accountancy-tuition-durg',
  '/class-6-tuition-durg',
  '/class-7-tuition-durg',
  '/class-8-tuition-durg',
  '/class-9-tuition-durg',
  '/class-10-tuition-durg',
  '/class-11-tuition-durg',
  '/class-12-tuition-durg',
  '/ug-tuition-durg',
  '/pg-tuition-durg'
]

function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0]

  const urlElements = publicRoutes
    .map((route) => {
      const priority = route === '' ? '1.0' : route.includes('tuition') ? '0.9' : '0.8'
      const changefreq = route === '' ? 'daily' : 'weekly'
      return `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    })
    .join('\n')

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`

  const publicDir = path.resolve(__dirname, '../public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml')
  fs.writeFileSync(sitemapPath, xmlContent, 'utf8')
  console.log(`✅ Sitemap successfully generated at: ${sitemapPath}`)
}

generateSitemap()
