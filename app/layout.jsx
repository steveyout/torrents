import '@/global.css';

import Script from 'next/script';
import { CONFIG } from '@/config-global';
import PRIMARY_COLOR from '@/theme/with-settings/primary-color.json';
import { LocalizationProvider } from '@/locales';
import { Snackbar } from '@/components/snackbar';
import { detectLanguage } from '@/locales/server';
import { I18nProvider } from '@/locales/i18n-provider';
import { ThemeProvider } from '@/theme/theme-provider';
import { ProgressBar } from '@/components/progress-bar';
import { GtagTracker } from '@/components/analytics';
import { MotionLazy } from '@/components/animate/motion-lazy';
import { detectSettings } from '@/components/settings/server';
import { getInitColorSchemeScript } from '@/theme/color-scheme-script';
import { SettingsDrawer, defaultSettings, SettingsProvider } from '@/components/settings';

// ----------------------------------------------------------------------

export const metadata = {
  title: {
    default: 'Youplex - Fast Torrent Search Engine & Magnet Links',
    template: '%s | Youplex Torrents',
  },
  description:
    'Search and download verified torrents & magnet links across major torrent sites: The Pirate Bay (TPB), 1337x, YTS, LimeTorrents, TorrentGalaxy, EZTV, RARBG, and FitGirl Repacks. Fast, high-speed seeds for 4K/1080p Movies, TV Series, PC Games, FLAC Music, Audiobooks, and Books.',
  keywords: [
    'The Pirate Bay',
    'PirateBay',
    'TPB',
    '1337x',
    'YTS',
    'YIFY',
    'LimeTorrents',
    'TorrentGalaxy',
    'TGx',
    'EZTV',
    'RARBG',
    'FitGirl Repacks',
    'DODI Repacks',
    'Free Movies Download',
    'Download 4K Movies',
    'TV Series Magnet Links',
    'PC Games Torrents',
    'FLAC Music Torrents',
    'Audiobook Torrents',
    'Fast Torrent Search',
    'Verified Torrent Seeds',
  ],
  openGraph: {
    title: 'Youplex - Fast Torrent Search Engine & Magnet Links',
    description:
      'Search and download verified torrents across TPB, 1337x, YTS, LimeTorrents, TorrentGalaxy, and more. 4K Movies, TV Series, PC Games, FLAC Music, and Books.',
    siteName: 'Youplex',
    images: [
      {
        url: '/assets/logo/logo-single.svg',
        width: 512,
        height: 512,
        alt: 'Youplex Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Youplex - Fast Torrent Search Engine & Magnet Links',
    description:
      'Search and download verified torrents across TPB, 1337x, YTS, LimeTorrents, TorrentGalaxy, and more.',
    images: ['/assets/logo/logo-single.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: [
    {
      rel: 'icon',
      url: `${CONFIG.site.basePath}/logo/favicon/favicon-32x32.png`,
      sizes: '32x32',
      type: 'image/png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: `${CONFIG.site.basePath}/logo/favicon/favicon-16x16.png`,
    },
    {
      rel: 'icon',
      url: `${CONFIG.site.basePath}/favicon.ico`,
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: `${CONFIG.site.basePath}/logo/favicon/apple-touch-icon.png`,
    },
  ],
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: PRIMARY_COLOR.dark,
};

export default async function RootLayout({ children }) {
  const lang = CONFIG.isStaticExport ? 'en' : await detectLanguage();

  const settings = CONFIG.isStaticExport ? defaultSettings : await detectSettings();

  return (
    <html lang={lang ?? 'en'} suppressHydrationWarning>
      <body>
        {getInitColorSchemeScript}
        <I18nProvider lang={CONFIG.isStaticExport ? undefined : lang}>
          <LocalizationProvider>
            <SettingsProvider
              settings={settings}
              caches={CONFIG.isStaticExport ? 'localStorage' : 'cookie'}
            >
              <ThemeProvider>
                <MotionLazy>
                  <Snackbar />
                  <ProgressBar />
                  <SettingsDrawer />
                  {/* Google tag (gtag.js) analytics */}
                  <GtagTracker />
                  {children}
                </MotionLazy>
              </ThemeProvider>
            </SettingsProvider>
          </LocalizationProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
