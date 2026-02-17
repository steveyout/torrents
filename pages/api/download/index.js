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
      });
    });

    // Ensure we have 'info' property needed for toTorrentFile
    // Note: magnet links don't contain full 'info' (pieces/length) 
    // unless they are fetched via 'remote' from a .torrent file.
    if (!torrentData.info) {
      throw new Error("Cannot generate a .torrent file from a magnet link without metadata. Please provide a direct .torrent URL.");
    }

    // Convert the parsed object back into a .torrent file Buffer
    const torrentBuffer = toTorrentFile(torrentData);

    // Sanitize filename
    const name = torrentData.name || 'download';
    const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    // Set headers for file download
    res.setHeader('Content-Type', 'application/x-bittorrent');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.torrent"`);

    // Send the buffer
    return res.status(200).send(torrentBuffer);

  } catch (error) {
    console.error('Processing Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate torrent file', 
      message: error.message 
    });
  }
}
