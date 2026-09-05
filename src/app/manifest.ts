import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'شاهد الحدث اليوم',
    short_name: 'شاهد الحدث اليوم',
    description: 'شاهد الحدث اليوم | Premium Streaming',
    start_url: '/',
    display: 'standalone',
    background_color: '#08090c',
    theme_color: '#800020',
    icons: [
      {
        src: '/pwa-icon-ar-192-v2.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-icon-ar-512-v2.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
