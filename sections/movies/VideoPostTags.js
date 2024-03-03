import PropTypes from "prop-types";
// @mui
import { Box, Chip, Stack, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Iconify from "@/components/Iconify";
import Label from "@/components/Label";
import useResponsive from "@/hooks/useResponsive";
import parseTorrent, { toTorrentFile } from "parse-torrent";
import useDownloader from "react-use-downloader";

// components

// ----------------------------------------------------------------------

VideoPostTags.propTypes = {
  post: PropTypes.object.isRequired,
};

export default function VideoPostTags({ post }) {
  let { genres,torrents,title} = post;
  const isDesktop = useResponsive('up', 'sm');
  const file=async (url) => {
    const source = await parseTorrent(url);
    const buffer =  await toTorrentFile({info:source});
    const blob =  new Blob([buffer]);

    return URL.createObjectURL(blob);
  }
  const { download } = useDownloader();

  return (
    <>
    <Box sx={{ py: 3 }}>
        <Typography variant="h6">
            Tags
        </Typography>
      {genres &&
        genres.map((tag) => <Chip key={tag} label={tag} sx={{ m: 0.5 }} variant={'outlined'} />)}
    </Box>

      <Box sx={{ py: 3 }}>
        <Typography variant="h6">
         Download Torrents
        </Typography>
        {torrents&&
          <Stack direction={isDesktop?'row':'column'} alignItems={'center'} justifyContent={'space-between'}>
          <Button variant={'contained'}  startIcon={<Iconify icon="mynaui:magnet" sx={{ width: 20, height: 20 }} />} sx={{mb:3}}
                  onClick={async () => download(await file(torrents.en['1080p'].url), `${title}.torrent`)}
          >
            1080p
           <Label variant={'filled'} color={'warning'}>{torrents.en['1080p'].seed} seeders</Label>
            <Label variant={'filled'} color={'error'}>{torrents.en['1080p'].peer} leechers</Label>
            <Label variant={'filled'} color={'secondary'}>{torrents.en['1080p'].filesize}</Label>
          </Button>
            <Button variant={'contained'}  startIcon={<Iconify icon="mynaui:magnet" sx={{ width: 20, height: 20 }} />} sx={{mb:3}}
                    onClick={() => download(file(torrents.en['720p'].url), `${title}.torrent`)}
            >
              720p
              <Label variant={'filled'} color={'warning'}>{torrents.en['720p'].seed} seeders</Label>
              <Label variant={'filled'} color={'error'}>{torrents.en['720p'].peer} leechers</Label>
              <Label variant={'filled'} color={'secondary'}>{torrents.en['720p'].filesize}</Label>
            </Button>
          </Stack>
        }
      </Box>
    </>
  );
}
