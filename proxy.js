import { NextResponse } from 'next/server';
import BLOCKED_URLS from './config/dmca-blocked.json';

export function proxy(request) {
  const url = new URL(request.url);
  const currentId = url.searchParams.get('id');
  const requestPath = url.pathname.replace(/\/+$/, '') || '/';

  const isBlocked = BLOCKED_URLS.some((item) => {
    // 1. Check if ID matches
    if (item.id && currentId && String(item.id) === String(currentId)) {
      return true;
    }

    // 2. Check if pathname matches (exact or subpaths e.g. /play)
    if (item.pathname) {
      const blockedPath = item.pathname.replace(/\/+$/, '');
      const blockedTorrentPath = blockedPath.replace(/^\/watch/, '/torrent');
      const blockedTorrentsPath = blockedPath.replace(/^\/watch/, '/torrents');
      if (
        requestPath === blockedPath ||
        requestPath.startsWith(`${blockedPath}/`) ||
        requestPath === blockedTorrentPath ||
        requestPath.startsWith(`${blockedTorrentPath}/`) ||
        requestPath === blockedTorrentsPath ||
        requestPath.startsWith(`${blockedTorrentsPath}/`)
      ) {
        return true;
      }
    }

    return false;
  });

  if (isBlocked) {
    return new NextResponse('Gone - Content removed pursuant to DMCA', {
      status: 410,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  return NextResponse.next();
}

export default proxy;

// Match all /torrent, /torrents, and legacy /watch routes to enforce DMCA blocks dynamically
export const config = {
  matcher: [
    '/torrent/:path*',
    '/torrents/:path*',
    '/watch/:path*',
  ],
};
