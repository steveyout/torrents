import { CONFIG } from '@/config-global';
import { PostListHomeView } from '@/sections/movies/view';
import { getMovies, getTvShows, getTrending } from '@/actions/api';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Youplex - The Best Torrent Search Engine (The Pirate Bay, 1337x, YTS, LimeTorrents)`,
  description: `Search verified torrents & magnet links across The Pirate Bay, 1337x, YTS, LimeTorrents, TorrentGalaxy, EZTV, and FitGirl. 4K/1080p Movies, TV Series, PC Games, Lossless Music, Audiobooks, and Books.`,
  keywords: [
    'The Pirate Bay',
    '1337x',
    'YTS',
    'YIFY',
    'LimeTorrents',
    'TorrentGalaxy',
    'EZTV',
    'RARBG',
    'FitGirl Repacks',
    'DODI Repacks',
    'Torrents search',
    'Magnet links',
    'Movies torrents',
    'TV series torrents',
    'PC games torrents',
    'FLAC music torrents',
  ],
  openGraph: {
    title: `Youplex - Torrents Search & Magnet Hub`,
    description: `Discover and download verified torrents across The Pirate Bay, 1337x, YTS, LimeTorrents, and TorrentGalaxy on ${CONFIG.site.name}.`,
    type: 'website',
  },
};

export default async function Page() {
  // Fetch multiple categories in parallel for speed
  const [
    trendingData,
    popularMoviesData,
    topRatedTvData,
    upcomingMoviesData,
  ] = await Promise.all([
    getTrending('all', 'day'),
    getMovies('popular'),
    getTvShows('top_rated'),
    getMovies('upcoming'),
  ]);

  // Clean data results
  const data = {
    trending: trendingData?.results || [],
    popularMovies: popularMoviesData?.results || [],
    topRatedTv: topRatedTvData?.results || [],
    upcoming: upcomingMoviesData?.results || [],
  };

  return <PostListHomeView categories={data} />;
}
