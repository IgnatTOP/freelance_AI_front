import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/messages/',
          '/my-projects/',
          '/proposals/',
          '/profile/',
          '/analytics/',
          '/orders/create/',
          '/orders/*/edit/',
          '/orders/*/chat/',
          '/orders/*/proposal/',
          '/portfolio/create/',
          '/portfolio/*/edit/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/messages/',
          '/my-projects/',
          '/proposals/',
          '/profile/',
          '/analytics/',
          '/orders/create/',
          '/orders/*/edit/',
          '/orders/*/chat/',
          '/orders/*/proposal/',
          '/portfolio/create/',
          '/portfolio/*/edit/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

