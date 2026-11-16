import { MetadataRoute } from 'next'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://workspeakportugal.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/student/', '/management/'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
