import { NextResponse } from 'next/server';

// ----------------------------------------------------------------------

const JACKETT_URL = process.env.NEXT_PUBLIC_JACKETT_API_URL || 'https://jackett.youplex.site';
const JACKETT_KEY = process.env.NEXT_PUBLIC_JACKETT_API_KEY || 'quso5pnjk22smvl7f50l6q0mire0mr7q';

// Category mapping to primary Torznab category numbers (single IDs to avoid tracker query parsing errors)
const CATEGORY_MAP = {
  all: '',
  movies: '2000',
  tv: '5000',
  games: '4000',
  music: '3000',
  audio: '3000',
  books: '7000',
};

// Verified active, healthy, fast indexers per category
const CATEGORY_INDEXERS = {
  movies: ['yts', 'thepiratebay', 'nyaasi', 'torrentproject2'],
  tv: ['thepiratebay', 'nyaasi', 'torrentproject2'],
  games: ['thepiratebay', 'nyaasi', 'torrentproject2'],
  music: ['thepiratebay', 'torrentproject2', 'internetarchive'],
  audio: ['thepiratebay', 'internetarchive', 'torrentproject2'],
  books: ['thepiratebay', 'internetarchive', 'torrentproject2'],
  all: ['yts', 'thepiratebay', 'nyaasi', 'torrentproject2'],
};

// Simple in-memory response cache (5 min TTL)
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// ----------------------------------------------------------------------

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = (searchParams.get('category') || 'all').toLowerCase();
  const year = searchParams.get('year') || '';
  const season = searchParams.get('season') || '';
  const episode = searchParams.get('episode') || '';
  const limit = parseInt(searchParams.get('limit') || '40', 10);

  // Environment and request indexer configuration
  const envIndexer = process.env.JACKETT_INDEXER || process.env.NEXT_PUBLIC_JACKETT_INDEXER || '';
  const requestedIndexers = (searchParams.get('indexers') || searchParams.get('indexer') || envIndexer || '').trim();

  // Construct query string
  let finalSearchQuery = q.trim();
  if (season) {
    const sStr = String(season).padStart(2, '0');
    if (episode) {
      const eStr = String(episode).padStart(2, '0');
      finalSearchQuery = `${finalSearchQuery} S${sStr}E${eStr}`;
    } else {
      finalSearchQuery = `${finalSearchQuery} S${sStr}`;
    }
  } else if (year && !finalSearchQuery.includes(year)) {
    finalSearchQuery = `${finalSearchQuery} ${year}`;
  }

  // Handle empty search for non-movie categories (e.g. Games, Music, Books on home tabs)
  if (!finalSearchQuery) {
    if (category === 'games') finalSearchQuery = 'repack';
    else if (category === 'music') finalSearchQuery = 'flac';
    else if (category === 'audio') finalSearchQuery = 'audiobook';
    else if (category === 'books') finalSearchQuery = 'epub';
  }

  const cacheKey = `${category}_${finalSearchQuery}_${limit}_${requestedIndexers}`;
  const cachedData = getCached(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  const catCode = CATEGORY_MAP[category] || '';
  const candidateIndexers = CATEGORY_INDEXERS[category] || CATEGORY_INDEXERS.all;

  // Determine which indexers to query
  let targetIndexers = [];

  if (requestedIndexers && requestedIndexers.toLowerCase() !== 'all') {
    targetIndexers = requestedIndexers
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((idx) => candidateIndexers.includes(idx) || ['yts', 'thepiratebay', 'nyaasi', 'torrentproject2', 'internetarchive'].includes(idx));
  }

  if (targetIndexers.length === 0) {
    targetIndexers = candidateIndexers.slice(0, 4);
  }

  try {
    const allItems = [];
    const queriedIndexers = [];

    // Helper to fetch from a single indexer safely
    const fetchIndexer = async (indexerId, queryStr, useCat = true) => {
      const url = new URL(`${JACKETT_URL}/torznab/${indexerId}/api`);
      url.searchParams.set('apikey', JACKETT_KEY);
      url.searchParams.set('t', 'search');
      if (queryStr) url.searchParams.set('q', queryStr);

      // Only pass category if the tracker supports it cleanly (skip for YTS which is movies only and TPB with text search)
      if (useCat && catCode && indexerId !== 'yts' && indexerId !== 'thepiratebay') {
        url.searchParams.set('cat', catCode);
      }

      try {
        const res = await fetch(url.toString(), {
          signal: AbortSignal.timeout(5000),
          headers: {
            Accept: 'application/rss+xml, application/xml, text/xml',
            'User-Agent': 'Youplex-Torrents/2.0',
          },
        });

        if (!res.ok) {
          return { indexer: indexerId, items: [] };
        }

        const xmlText = await res.text();
        const items = parseTorznabXml(xmlText, indexerId);
        return { indexer: indexerId, items };
      } catch (err) {
        return { indexer: indexerId, items: [], error: err.message };
      }
    };

    // Query target indexers in parallel
    const fetchPromises = targetIndexers.map((indexerId) => fetchIndexer(indexerId, finalSearchQuery, true));
    const results = await Promise.allSettled(fetchPromises);

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        queriedIndexers.push(r.value.indexer);
        if (r.value.items && r.value.items.length > 0) {
          allItems.push(...r.value.items);
        }
      }
    }

    // Fallback if initial query returned 0 items: try sanitized queries (without colons, dashes, or year)
    if (allItems.length === 0 && finalSearchQuery) {
      const cleanWithYear = finalSearchQuery.replace(/[:\-–—_.]/g, ' ').replace(/\s+/g, ' ').trim();
      const rawTitleNoYear = q.replace(/[:\-–—_.]/g, ' ').replace(/\s+/g, ' ').trim();
      const fallbackCandidates = [cleanWithYear, rawTitleNoYear, q.trim()].filter(
        (val, idx, arr) => val && arr.indexOf(val) === idx && val !== finalSearchQuery
      );

      for (const fallbackQ of fallbackCandidates) {
        if (allItems.length > 0) break;
        const fallbackPromises = targetIndexers.slice(0, 3).map((indexerId) => fetchIndexer(indexerId, fallbackQ, false));
        const fallbackRes = await Promise.allSettled(fallbackPromises);
        for (const fb of fallbackRes) {
          if (fb.status === 'fulfilled' && fb.value && fb.value.items?.length > 0) {
            allItems.push(...fb.value.items);
          }
        }
      }
    }

    // Deduplicate by infohash or normalized title
    const seen = new Set();
    const uniqueItems = [];

    for (const item of allItems) {
      const hashKey = item.infoHash || item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(hashKey)) {
        seen.add(hashKey);
        uniqueItems.push(item);
      }
    }

    // Sort by seeders descending
    uniqueItems.sort((a, b) => (b.seeders || 0) - (a.seeders || 0));

    const finalResults = {
      success: true,
      query: finalSearchQuery,
      category,
      indexers: queriedIndexers,
      total: uniqueItems.length,
      torrents: uniqueItems.slice(0, limit),
    };

    setCached(cacheKey, finalResults);
    return NextResponse.json(finalResults);
  } catch (err) {
    console.error('[API Torrents Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message, torrents: [] },
      { status: 500 }
    );
  }
}

// Helper to parse Torznab RSS XML
function parseTorznabXml(xmlText, indexerName) {
  if (!xmlText || typeof xmlText !== 'string') return [];

  const items = [];
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    const getTag = (tag) => {
      const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return match ? match[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') : '';
    };

    const getAttr = (name) => {
      const match =
        itemXml.match(new RegExp(`<torznab:attr[^>]*name=["']${name}["'][^>]*value=["']([^"']*)["']`, 'i')) ||
        itemXml.match(new RegExp(`<torznab:attr[^>]*value=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'));
      return match ? match[1] : '';
    };

    const enclosureMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']*)["']/i);
    const enclosureUrl = enclosureMatch ? enclosureMatch[1].replace(/&amp;/g, '&') : '';

    const title = getTag('title');
    const rawLink = getTag('link');
    const link = rawLink ? rawLink.replace(/&amp;/g, '&') : '';
    const rawSize = getTag('size') || getAttr('size');
    const pubDate = getTag('pubDate');
    const seeders = parseInt(getAttr('seeders') || '0', 10);
    const peers = parseInt(getAttr('peers') || '0', 10);
    const leechers = peers > seeders ? peers - seeders : 0;
    const rawMagnet = getAttr('magneturl') || (link.startsWith('magnet:') ? link : '');
    const magnetUrl = rawMagnet ? rawMagnet.replace(/&amp;/g, '&') : '';
    const rawDownload = link.startsWith('http') ? link : enclosureUrl;
    const directUrl = rawDownload ? rawDownload.replace(/&amp;/g, '&') : '';

    const category = getAttr('category') || getTag('category');
    const infoHash = getAttr('infohash') || extractInfoHash(magnetUrl);

    // Format pubDate as standard ISO 8601 string for robust frontend parsing & age calculations
    let formattedPubDate = '';
    if (pubDate) {
      const d = new Date(pubDate);
      if (!isNaN(d.getTime())) {
        formattedPubDate = d.toISOString();
      } else {
        formattedPubDate = pubDate;
      }
    }

    // Pass directUrl/magnetUrl and infohash to download endpoint
    const targetDirect = directUrl || magnetUrl || '';
    const downloadUrl = targetDirect
      ? `/api/torrents/download?url=${encodeURIComponent(targetDirect)}&title=${encodeURIComponent(title)}&hash=${encodeURIComponent(infoHash || '')}`
      : '';

    const actualIndexer = getTag('jackettindexer') || indexerName;

    if (title && (magnetUrl || directUrl)) {
      items.push({
        id: infoHash || `${title}-${seeders}-${rawSize}`,
        title,
        cleanTitle: cleanTorrentTitle(title),
        size: formatBytes(rawSize),
        rawSize: parseInt(rawSize, 10) || 0,
        pubDate: formattedPubDate,
        seeders,
        peers,
        leechers,
        magnetUrl,
        downloadUrl,
        directUrl,
        infoHash,
        category: formatCategory(category),
        indexer: formatIndexerName(actualIndexer),
        resolution: detectResolution(title),
        health: seeders >= 10 ? 'healthy' : seeders >= 3 ? 'warning' : 'low',
      });
    }
  }

  return items;
}

function extractInfoHash(magnet) {
  if (!magnet) return '';
  const match = magnet.match(/urn:btih:([a-zA-Z0-9]+)/i);
  return match ? match[1].toLowerCase() : '';
}

function cleanTorrentTitle(title) {
  if (!title) return '';
  return title
    .replace(/\b(1080p|720p|2160p|4k|uhd|hdr|hevc|x264|x265|aac|dts|bluray|web-dl|webrip|brrip|repack)\b/gi, '')
    .replace(/[\[\]._-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatBytes(bytes) {
  const num = parseInt(bytes, 10);
  if (!num || isNaN(num) || num === 0) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(1024));
  return `${(num / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function detectResolution(title) {
  const t = (title || '').toUpperCase();
  if (t.includes('2160P') || t.includes('4K') || t.includes('UHD')) return '4K UHD';
  if (t.includes('1080P') || t.includes('FHD')) return '1080p';
  if (t.includes('720P') || t.includes('HD')) return '720p';
  return 'HD';
}

function formatIndexerName(name) {
  if (!name) return 'Tracker';
  const clean = name.replace(/clone/i, '').replace(/[^a-zA-Z0-9]/g, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function formatCategory(cat) {
  if (!cat) return '';
  const c = String(cat);
  if (c.startsWith('2')) return 'Movie';
  if (c.startsWith('5')) return 'TV Show';
  if (c.startsWith('1') || c.startsWith('4')) return 'Game';
  if (c.startsWith('3')) return 'Audio';
  if (c.startsWith('7')) return 'Book';
  return '';
}
