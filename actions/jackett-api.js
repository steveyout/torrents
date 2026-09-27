/**
 * Jackett Torrents API Client
 * Queries /api/torrents endpoint which uses tested, healthy indexers (at least 2 in parallel)
 */

export async function searchTorrents({
  query = '',
  category = 'all',
  year = '',
  season = '',
  ep = '',
  indexers = '',
  limit = 40,
} = {}) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category) params.set('category', category);
  if (year) params.set('year', String(year));
  if (season) params.set('season', String(season));
  if (ep) params.set('ep', String(ep));
  if (indexers) params.set('indexers', Array.isArray(indexers) ? indexers.join(',') : indexers);
  if (limit) params.set('limit', String(limit));

  // Determine origin if running server-side vs client-side
  const origin = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000');
  const res = await fetch(`${origin}/api/torrents?${params.toString()}`, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch torrents: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Convenience helper to get torrents for a specific media title
 */
export async function getTorrentsForMedia({ title, year, type = 'movie', season = '', episode = '' }) {
  const category = type === 'tv' ? 'tv' : 'movies';
  return searchTorrents({
    query: title,
    category,
    year,
    season,
    ep: episode,
    limit: 50,
  });
}

/**
 * Fetch torrents for non-movie categories (games, music, audio, books)
 */
export async function getCategoryTorrents(category, query = '', limit = 30) {
  return searchTorrents({
    query,
    category,
    limit,
  });
}
