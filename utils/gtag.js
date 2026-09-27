// Google Analytics (gtag.js) utility

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GTAG_ID || '';

/**
 * Log pageview with custom URL path
 * @param {string} url
 */
export const pageview = (url) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

/**
 * Log specific event
 * @param {object} options
 * @param {string} options.action
 * @param {string} [options.category]
 * @param {string} [options.label]
 * @param {number} [options.value]
 */
export const event = ({ action, category, label, value, ...customParams }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
      ...customParams,
    });
  }
};

/**
 * Track torrent download or magnet link interaction
 * @param {object} torrent
 * @param {'file' | 'magnet' | 'client'} method
 */
export const trackDownload = (torrent, method = 'file') => {
  event({
    action: `torrent_download_${method}`,
    category: 'Torrents',
    label: torrent?.title || 'Unknown Release',
    indexer: torrent?.indexer || torrent?.tracker || 'unknown',
    size: torrent?.size || '',
    seeders: torrent?.seeders || 0,
  });
};

/**
 * Track search queries across categories
 * @param {string} query
 * @param {string} category
 */
export const trackSearch = (query, category = 'all') => {
  if (!query || !query.trim()) return;
  event({
    action: 'search',
    category: 'Search',
    label: `${category}:${query.trim()}`,
    search_term: query.trim(),
    search_category: category,
  });
};
