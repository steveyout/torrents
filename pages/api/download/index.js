import parseTorrent, { toTorrentFile} from "parse-torrent";
import WebTorrent from 'webtorrent';



export default async function handler(req, res) {
  try {
    const client = new WebTorrent();
    const url  = await req.query.url;
    const torrent = await client.add(url);
    await client.on('torrent', function (torrent) {
      res.status(200).end(torrent.torrentFile)
      torrent.destroy()
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to load data' });
  }
}
