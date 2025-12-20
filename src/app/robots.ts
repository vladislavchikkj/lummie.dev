import { MetadataRoute } from 'next'
import { APP_URL } from './constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/projects/', '/profile/', '/settings/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/projects/', '/profile/', '/settings/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}






