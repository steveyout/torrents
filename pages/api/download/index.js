import parseTorrent, { toTorrentFile } from "parse-torrent";

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL query parameter is required' });
    }

    // parseTorrent can fetch metadata from a magnet link or a remote URL
    // We wrap it in a promise to handle it cleanly in the async handler
    const torrentData = await new Promise((resolve, reject) => {
      parseTorrent.remote(url, (err, parsed) => {
        if (err) reject(err);
        else resolve(parsed);
      });
    });

    // Convert the parsed metadata back into a .torrent file buffer
    const torrentBuffer = toTorrentFile(torrentData);

    // Set headers to force download in the browser
    const fileName = torrentData.name ? `${torrentData.name}.torrent` : 'download.torrent';
    
    res.setHeader('Content-Type', 'application/x-bittorrent');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    
    // Send the buffer
    return res.status(200).send(torrentBuffer);

  } catch (error) {
    console.error('Torrent parsing error:', error);
    return res.status(500).json({ 
      error: 'Failed to parse torrent metadata', 
      details: error.message 
    });
  }
}
