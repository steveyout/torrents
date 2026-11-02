import { CONFIG } from '@/config-global';

// ----------------------------------------------------------------------

export default function robots() {
  const baseUrl = CONFIG.site.serverUrl || 'https://youplex.cc';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/search',
          '/search/*',
          '/watch/*',
          '/tv-ui/*',
          '/*?*sn=*',
          '/*?*ep=*',
          '/*?*season=*',
          '/*?*episode=*',
          '/*?*sort=*',
          '/*?*order=*',
          '/*?*indexers=*',
          '/*?*filter=*',
        ],
      },
      {
        userAgent: ['Googlebot', 'bingbot', 'YandexBot'],
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/search',
          '/search/*',
          '/watch/*',
          '/tv-ui/*',
          '/*?*sn=*',
          '/*?*ep=*',
          '/*?*sort=*',
          '/*?*order=*',
          '/*?*indexers=*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
