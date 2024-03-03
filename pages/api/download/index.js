import parseTorrent, { toTorrentFile } from "parse-torrent";
import fs from 'fs';
import stream from 'stream';



export default async function handler(req, res) {
  try {
    const url  = await req.query.url;
    const source = await parseTorrent(url);
    const buffer =  toTorrentFile({ info: source });

    res.end(buffer)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to load data' });
  }
}
