import { CONFIG } from '@/config-global';
import { getMovies, getTvShows } from '@/actions/api';

// ----------------------------------------------------------------------

export default async function sitemap() {
  const rawBase = CONFIG.site.serverUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://youplex.cc';
  const baseUrl = (rawBase.includes('youplex.site') ? 'https://youplex.cc' : rawBase).replace(/\/+$/, '');

  // 1. Core High-Priority Category Landing Pages
  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/movies', priority: 0.9, changeFrequency: 'daily' },
    { path: '/tv', priority: 0.9, changeFrequency: 'daily' },
    { path: '/torrents', priority: 0.9, changeFrequency: 'daily' },
    { path: '/games', priority: 0.8, changeFrequency: 'daily' },
    { path: '/music', priority: 0.8, changeFrequency: 'daily' },
    { path: '/books', priority: 0.8, changeFrequency: 'daily' },
    { path: '/audio', priority: 0.8, changeFrequency: 'daily' },
  ].map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  // 2. Dynamic Movie Routes (Popular & Trending)
  let movieRoutes = [];
  try {
    const popularMovies = await getMovies('popular', 1);
    const topMovies = await getMovies('top_rated', 1).catch(() => ({ results: [] }));
    const allMovies = [...(popularMovies?.results || []), ...(topMovies?.results || [])];

    const seenMovieIds = new Set();
    movieRoutes = allMovies
      .filter((movie) => {
        if (!movie?.id || !movie?.title || seenMovieIds.has(movie.id)) return false;
        seenMovieIds.add(movie.id);
        return true;
      })
      .map((movie) => {
        const slug = encodeURIComponent(
          movie.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        );
        return {
          url: `${baseUrl}/torrent/movie/${slug}?id=${movie.id}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 0.8,
        };
      });
  } catch (error) {
    console.error('Sitemap Movie Error:', error);
  }

  // 3. Dynamic TV Series Routes (Popular & Top Rated)
  let tvRoutes = [];
  try {
    const popularTv = await getTvShows('popular', 1);
    const topTv = await getTvShows('top_rated', 1).catch(() => ({ results: [] }));
    const allTv = [...(popularTv?.results || []), ...(topTv?.results || [])];

    const seenTvIds = new Set();
    tvRoutes = allTv
      .filter((tv) => {
        if (!tv?.id || !tv?.name || seenTvIds.has(tv.id)) return false;
        seenTvIds.add(tv.id);
        return true;
      })
      .map((tv) => {
        const slug = encodeURIComponent(
          tv.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        );
        return {
          url: `${baseUrl}/torrent/tv/${slug}?id=${tv.id}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 0.8,
        };
      });
  } catch (error) {
    console.error('Sitemap TV Error:', error);
  }

  return [...staticRoutes, ...movieRoutes, ...tvRoutes];
}
