import { MetadataRoute } from 'next'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://workspeakportugal.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: appUrl, priority: 1.0 },
    { url: `${appUrl}/portuguese`, priority: 0.9 },
    { url: `${appUrl}/english`, priority: 0.9 },
    { url: `${appUrl}/pricing`, priority: 0.8 },
    { url: `${appUrl}/assessment`, priority: 0.9 },
    { url: `${appUrl}/contact`, priority: 0.7 },
    { url: `${appUrl}/login`, priority: 0.5 },
    { url: `${appUrl}/register`, priority: 0.5 },
    { url: `${appUrl}/privacy`, priority: 0.3 },
    { url: `${appUrl}/terms`, priority: 0.3 },
    { url: `${appUrl}/cookies`, priority: 0.2 },
  ]

  return staticPages.map((page) => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: page.priority,
  }))
}
