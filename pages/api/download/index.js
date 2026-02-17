import parseTorrent, { remote, toTorrentFile } from 'parse-torrent';

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL query parameter is required' });
    }

    // Use the named 'remote' function from the docs to fetch metadata
    const torrentData = await new Promise((resolve, reject) => {
      remote(url, { timeout: 30 * 1000 }, (err, parsed) => {
        if (err) {
          // Fallback: If remote fails (e.g. it was just a magnet string, not a URL)
          // try parsing the string directly using the default export
          try {
            const result = parseTorrent(url);
            if (result.infoHash) return resolve(result);
            reject(err);
          } catch (e) {
            reject(new Error("Invalid torrent source or timeout fetching remote file."));
          }
        } else {
          resolve(parsed);
        }
      });import parseTorrent, { remote, toTorrentFile } from 'parse-torrent';
import WebTorrent from 'webtorrent';

export default async function handler(req, res) {
  // Increase timeout because fetching metadata from peers can take a few seconds
  const timeoutMs = 30000; 

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL query parameter is required' });
    }

    let torrentMetadata;

    if (url.startsWith('magnet:')) {
      // --- CASE 1: MAGNET LINK ---
      // We must use a WebTorrent client to fetch metadata from peers
      const client = new WebTorrent();
      
      torrentMetadata = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.destroy();
          reject(new Error("Metadata fetch timeout (no seeds found for this magnet)"));
        }, timeoutMs);

        client.add(url, (torrent) => {
          // 'metadata' event fires when the info dict is received from peers
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
      // --- CASE 2: DIRECT HTTP/HTTPS URL ---
      torrentMetadata = await new Promise((resolve, reject) => {
        remote(url, { timeout: timeoutMs }, (err, parsed) => {
          if (err) reject(err);
          else resolve(parsed);
        });
      });
    }

    // Convert the resolved metadata into the .torrent file buffer
    const torrentBuffer = toTorrentFile(torrentMetadata);

    const fileName = (torrentMetadata.name || 'download')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();

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
