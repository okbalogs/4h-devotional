export default function manifest() {
  return {
    name: 'Editorial Devotion',
    short_name: 'Devotion',
    description: 'Your 4H Quiet Time Sanctuary — Head, Heart, Hand, Help.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fdf6ec',
    theme_color: '#9d4f14',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
