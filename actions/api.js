import axios, { endpoints } from '@/utils/axios';

// ----------------------------------------------------------------------
// Simple in-memory response cache for TMDB requests to boost performance
const tmdbCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  const item = tmdbCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    tmdbCache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  if (tmdbCache.size > 200) {
    const firstKey = tmdbCache.keys().next().value;
    tmdbCache.delete(firstKey);
  }
  tmdbCache.set(key, { data, timestamp: Date.now() });
}

// ----------------------------------------------------------------------

/**
 * Fetch Movie or Show details from TMDB
 * @param {string} type - 'movie' or 'tv'
 * @param {string|number} id - TMDB ID
 */
export async function getMovieOrShow(type, id) {
  const details = await getMediaDetails(type, id);

  if (!details) return null;

  return {
    ...details,
    title: details.title || details.name,
  };
}

// ----------------------------------------------------------------------

/**
 * Fetch Movies by category
 * @param {string} category - 'popular', 'top_rated', 'upcoming', 'now_playing'
 * @param {number} page - Default 1
 */
export async function getMovies(category = 'popular', page = 1) {
  const cacheKey = `movie_${category}_${page}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await axios.get(endpoints.tmdb.movie(category), {
    params: { page },
  });

  setCached(cacheKey, res.data);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Fetch TV Shows by category
 * @param {string} category - 'popular', 'top_rated', 'on_the_air', 'airing_today'
 * @param {number} page - Default 1
 */
export async function getTvShows(category = 'popular', page = 1) {
  const cacheKey = `tv_${category}_${page}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await axios.get(endpoints.tmdb.tv(category), {
    params: { page },
  });

  setCached(cacheKey, res.data);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Fetch Details for a specific Movie or TV Show
 * @param {string} type - 'watch' or 'tv'
 * @param {string|number} id - TMDB ID
 */
export async function getMediaDetails(type, id) {
  const url = id ? endpoints.tmdb.details(type, id) : '';

  if (!url) return null;

  const cacheKey = `details_${type}_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await axios.get(url, {
    params: {
      append_to_response: 'credits',
    },
  });

  setCached(cacheKey, res.data);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Fetch Trending Content
 * @param {string} type - 'all', 'watch', 'tv', 'person'
 * @param {string} timeWindow - 'day' or 'week'
 */
export async function getTrending(type = 'all', timeWindow = 'day') {
  const cacheKey = `trending_${type}_${timeWindow}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await axios.get(endpoints.tmdb.trending(type, timeWindow));

  setCached(cacheKey, res.data);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Search Media on TMDB
 * @param {string} query
 * @param {number} page
 */
export async function searchMedia(query, page = 1) {
  const cacheKey = `search_${query}_${page}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await axios.get(endpoints.tmdb.search, {
    params: {
      query,
      page,
      include_adult: false,
    },
  });

  setCached(cacheKey, res.data);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Get Recommendations
 * @param {string} type
 * @param {string|number} id
 */
export async function getRecommendations(type, id) {
  const url = endpoints.tmdb.recommendations(type, id);

  if (!url) return { results: [] };

  const cacheKey = `rec_${type}_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await axios.get(url);
  setCached(cacheKey, res.data);
  return res.data;
}
