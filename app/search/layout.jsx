import { MainLayout } from '@/layouts/main';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Search Torrents & Magnet Links - The Pirate Bay, 1337x, YTS, LimeTorrents',
  description:
    'Search across all major torrent sites including The Pirate Bay, 1337x, YTS, LimeTorrents, TorrentGalaxy, EZTV, and RARBG. Instant magnet links, healthy seeders, 4K/1080p movies, games, and FLAC music.',
  keywords: [
    'The Pirate Bay search',
    '1337x search',
    'YTS search',
    'LimeTorrents search',
    'TorrentGalaxy search',
    'EZTV search',
    'FitGirl Repacks search',
    'Torrent search engine',
    'Magnet search',
    'Free torrent downloads',
  ],
};

export default function Layout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
