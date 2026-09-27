/**
 * Torrent Utilities for the Torrents App
 */

export const formatSize = (bytes?: number | string): string => {
  if (!bytes) return '-';
  const num = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
  if (num === 0 || isNaN(num)) return '-';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(1024));
  return (num / Math.pow(1024, Math.max(i - 1, 0))).toFixed(1) + ' ' + sizes[Math.max(i - 1, 0)];
};

export const formatSeeds = (seeders?: number, peers?: number): string => {
  if (!seeders && !peers) return '—';

  if (seeders) {
    return `${seeders}${peers ? ` (${peers})` : ''}`;
  }
  return String(seeders || '-');
};

export const isHealthyTorrent = (torrent: any): boolean => {
  return (torrent?.Seeders || torrent?.seeders || 0) > (torrent?.Peers || torrent?.leechers || 1);
};

/**
 * Generate magnet link from torrent data
 */
export const generateMagnetLink = (hash?: string, name?: string, trackers?: string[]): string => {
  if (!hash) return '';
  let magnet = `magnet:?xt=urn:btih:${hash.toUpperCase()}`;
  if (name) {
    magnet += `&dn=${encodeURIComponent(name)}`;
  }
  if (trackers && trackers.length > 0) {
    magnet += trackers.map((t) => `&tr=${encodeURIComponent(t)}`).join('');
  }
  return magnet;
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Extract clean title from TMDB results
 */
export const extractCleanTitle = (mediaItem: any): string => {
  if (!mediaItem) return '';

  // For movies
  if (mediaItem?._id || mediaItem?.movie_id) {
    return `${mediaItem.title} (${mediaItem.year || ''})`.trim();
  }

  // For TV shows
  if (mediaItem?._tvId || mediaItem?.tv_id) {
    return `${mediaItem.name || mediaItem.title}`;
  }

  return mediaItem.name || mediaItem.title || '';
};

export const getTorrentHealth = (seeders?: number, peers?: number): 'healthy' | 'warning' | 'low' => {
  const seeds = seeders || 0;
  const leechers = peers || 1;

  return seeds / leechers > 2 ? 'healthy' : seeds >= 5 ? 'warning' : 'low';
};

export default { formatSize, formatSeeds, generateMagnetLink, debounce };
