import { CONFIG } from '@/config-global';
import { getMovies } from '@/actions/api';
import { PostListHomeView } from '@/sections/movies/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Movie Torrents - ${CONFIG.site.name}`,
  description: `Find and download the latest movie torrents, top-rated cinema releases, and 4K/1080p torrents on ${CONFIG.site.name}.`,
  keywords: 'movie torrents, download movies, 4k movies, 1080p bluray torrents, yts, pirate bay',
  openGraph: {
    title: `Explore Movie Torrents - ${CONFIG.site.name}`,
    description: `Browse verified movie torrents on ${CONFIG.site.name}.`,
    type: 'website',
  },
};

export default async function Page() {
  // Fetch movie-specific categories in parallel
  const [
    popularData,
    topRatedData,
    upcomingData,
    nowPlayingData,
  ] = await Promise.all([
    getMovies('popular'),
    getMovies('top_rated'),
    getMovies('upcoming'),
    getMovies('now_playing'),
  ]);

  // Organizing data specifically for Movie views
  const data = {
    popular: popularData?.results || [],
    topRated: topRatedData?.results || [],
    upcoming: upcomingData?.results || [],
    nowPlaying: nowPlayingData?.results || [],
  };

  return <PostListHomeView categories={data} />;
}
