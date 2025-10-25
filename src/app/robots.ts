import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://jaaaaaemkim.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/auth'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
