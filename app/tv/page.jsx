import { CONFIG } from '@/config-global';
import { getTvShows } from '@/actions/api';
import { PostListHomeView } from '@/sections/movies/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `TV Series Torrents - ${CONFIG.site.name}`,
  description: `Download verified TV show torrents, season packs, and latest episodes on ${CONFIG.site.name}.`,
  keywords: 'tv show torrents, season pack torrents, tv series download, magnet links, the pirate bay',
  openGraph: {
    title: `Explore TV Show Torrents - ${CONFIG.site.name}`,
    description: `Browse verified TV series torrents on ${CONFIG.site.name}.`,
    type: 'website',
  },
};

export default async function Page() {
  // Fetch TV-specific categories in parallel
  const [
    popularData,
    topRatedData,
    onTheAirData,
    airingTodayData,
  ] = await Promise.all([
    getTvShows('popular'),
    getTvShows('top_rated'),
    getTvShows('on_the_air'),
    getTvShows('airing_today'),
  ]);

  const data = {
    airingToday: airingTodayData?.results || [],
    onTheAir: onTheAirData?.results || [],
    popular: popularData?.results || [],
    topRated: topRatedData?.results || [],
  };

  return <PostListHomeView categories={data} />;
}
