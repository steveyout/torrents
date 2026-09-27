import axios, { endpoints } from '@/utils/axios';

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
  const res = await axios.get(endpoints.tmdb.movie(category), {
    params: { page },
  });

  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Fetch TV Shows by category
 * @param {string} category - 'popular', 'top_rated', 'on_the_air', 'airing_today'
 * @param {number} page - Default 1
 */
export async function getTvShows(category = 'popular', page = 1) {
  const res = await axios.get(endpoints.tmdb.tv(category), {
    params: { page },
  });

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

  const res = await axios.get(url, {
    params: {
      append_to_response: 'credits',
    },
  });

  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Fetch Trending Content
 * @param {string} type - 'all', 'watch', 'tv', 'person'
 * @param {string} timeWindow - 'day' or 'week'
 */
export async function getTrending(type = 'all', timeWindow = 'day') {
  const res = await axios.get(endpoints.tmdb.trending(type, timeWindow));

  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Search Media on TMDB
 * @param {string} query
 * @param {number} page
 */
export async function searchMedia(query, page = 1) {
  const res = await axios.get(endpoints.tmdb.search, {
    params: {
      query,
      page,
      include_adult: false,
    },
  });

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

  const res = await axios.get(url);
  return res.data;
}
