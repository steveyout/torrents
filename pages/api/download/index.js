import parseTorrent, { toTorrentFile } from "parse-torrent";



export default async function handler(req, res) {
  try {
    const url  = await req.query.url;
    const source = await parseTorrent(url);
    const buffer =  Buffer.from(toTorrentFile({ info: source }));

    res.end(buffer)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to load data' });
  }
}
