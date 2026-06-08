export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://4h-devotional.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/explore',
          '/courses',
          '/fellowship',
          '/instructors',
          '/privacy',
          '/terms',
          '/support',
        ],
        disallow: [
          '/today/',
          '/history/',
          '/entry/',
          '/settings/',
          '/community/',
          '/signin',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
