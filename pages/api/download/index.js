import parseTorrent from 'parse-torrent'

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL query parameter is required' });
    }

    // Modern parse-torrent usage: Use parseTorrent.remote directly 
    // or fetch the buffer manually if it's a direct .torrent URL.
    const torrentData = await new Promise((resolve, reject) => {
      parseTorrent.remote(url, (err, parsed) => {
        if (err) {
          // If remote fails, it might be because the URL is a direct link
          // we try to parse the URL string itself (for magnets)
          try {
            const simpleParse = parseTorrent(url);
            resolve(simpleParse);
          } catch (e) {
            reject(err);
          }
        } else {
          resolve(parsed);
        }
      });
    });

    // Check if we have enough data to build a file
    if (!torrentData || !torrentData.infoHash) {
      throw new Error("Invalid torrent metadata received.");
    }

    // Convert parsed metadata to a .torrent file buffer
    const torrentBuffer = parseTorrent.toTorrentFile(torrentData);

    // Clean up the filename (remove special characters)
    const rawName = torrentData.name || 'download';
    const safeName = rawName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    // Set Headers
    res.setHeader('Content-Type', 'application/x-bittorrent');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.torrent"`);

    return res.status(200).send(torrentBuffer);

  } catch (error) {
    console.error('Torrent parsing error:', error);
    return res.status(500).json({ 
      error: 'Failed to process torrent', 
      message: error.message 
    });
  }
}
