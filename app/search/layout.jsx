import { MainLayout } from '@/layouts/main';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Search Torrents & Magnet Links - The Pirate Bay, YTS, Nyaasi',
  description:
    'Search across verified torrent indexers. Instant magnet links, healthy seeders, 4K/1080p movies, TV series, PC games, and FLAC music.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function Layout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
