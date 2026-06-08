export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://editorial-devotion.vercel.app';
  
  // Public crawlable pages
  const routes = [
    '',
    '/explore',
    '/courses',
    '/fellowship',
    '/instructors',
    '/privacy',
    '/terms',
    '/support',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
