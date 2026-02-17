import parseTorrent, { remote, toTorrentFile } from 'parse-torrent';
import WebTorrent from 'webtorrent';

// Force Vercel/Next.js to allow the function to run for 60 seconds
export const maxDuration = 60; 

export default async function handler(req, res) {
  const timeoutMs = 55000; // Stop just before the 60s limit

  try {
    let { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL query parameter is required' });
    }

    // Add high-quality trackers to speed up metadata discovery
    if (url.startsWith('magnet:')) {
      const trackers = [
        'udp://tracker.opentrackr.org:1337/announce',
        'udp://9.rarbg.com:2810/announce',
        'udp://tracker.openbittorrent.com:6969/announce',
        'http://tracker.openbittorrent.com:80/announce',
        'udp://exodus.desync.com:6969/announce'
      ];
      trackers.forEach(tr => {
        if (!url.includes(encodeURIComponent(tr))) {
          url += `&tr=${encodeURIComponent(tr)}`;
        }
      });
    }

    let torrentMetadata;

    if (url.startsWith('magnet:')) {
      const client = new WebTorrent();
      
      torrentMetadata = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.destroy();
          reject(new Error("Metadata fetch timeout. Ensure the magnet has active seeds."));
        }, timeoutMs);

        // dht: false can sometimes help in environments that block UDP
        client.add(url, (torrent) => {
          torrent.on('metadata', () => {
            clearTimeout(timeout);
            const parsed = parseTorrent(torrent.torrentFile);
            client.destroy();
            resolve(parsed);
          });
        });

        client.on('error', (err) => {
          clearTimeout(timeout);
          client.destroy();
          reject(err);
        });
      });

    } else {
      torrentMetadata = await new Promise((resolve, reject) => {
        remote(url, { timeout: timeoutMs }, (err, parsed) => {
          if (err) reject(err);
          else resolve(parsed);
        });
      });
    }

    const torrentBuffer = toTorrentFile(torrentMetadata);
    const fileName = (torrentMetadata.name || 'download')
      .replace(/[^a-z0-9]/gi, '_').toLowerCase();

    res.setHeader('Content-Type', 'application/x-bittorrent');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.torrent"`);

    return res.status(200).send(torrentBuffer);

  } catch (error) {
    console.error('Processing Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate torrent file', 
      message: error.message 
    });
  }
}
