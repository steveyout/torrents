import { CONFIG } from '@/config-global';

// ----------------------------------------------------------------------

export default function robots() {
  const rawBase = CONFIG.site.serverUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://youplex.cc';
  const baseUrl = (rawBase.includes('youplex.site') ? 'https://youplex.cc' : rawBase).replace(/\/+$/, '');

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
