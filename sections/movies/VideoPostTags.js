import PropTypes from "prop-types";
// @mui
import { Box, Chip, Stack, Typography } from "@mui/material";
import Iconify from "@/components/Iconify";
import Label from "@/components/Label";
import useResponsive from "@/hooks/useResponsive";
import useDownloader from "react-use-downloader";
import{useState} from 'react'
import LoadingButton from "@mui/lab/LoadingButton";

// components

// ----------------------------------------------------------------------

VideoPostTags.propTypes = {
  post: PropTypes.object.isRequired,
};

export default function VideoPostTags({ post }) {
  let { genres,torrents,title,episodes} = post;
  const isDesktop = useResponsive('up', 'sm');
  const[loading,setLoading]=useState(false)
  const { download } = useDownloader();
  if (episodes){
    torrents={
      en:{
        '1080p':JSON.parse(JSON.stringify(episodes[0].torrents[0]).replace('seeds','seed').replace('peers','peer')||null),
        '720p':JSON.parse(JSON.stringify(episodes[0].torrents['720p']||episodes[0].torrents['480p']).replace('seeds','seed').replace('peers','peer')||null)
      }
    }
    torrents.en['720p'].filesize='unknown'
    torrents.en['1080p'].filesize='uknown'
  }
  const downloadTorrent=async (url,title)=>{
    try{
      await setLoading(true);
      await download(url,title)
      await setLoading(false)
    }catch (e) {
      console.log(e)
    }
  }

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
          <>
          <Stack direction={isDesktop?'row':'column'} alignItems={'center'} justifyContent={'space-between'} sx={{mb:5}}>
            <Box sx={{mb:3}}>
              <Label variant={'filled'} color={'warning'} sx={{mr:2}}>{torrents.en['1080p'].seed} seeders</Label>
              <Label variant={'filled'} color={'error'} sx={{mr:2}}>{torrents.en['1080p'].peer} leechers</Label>
              <Label variant={'filled'} color={'secondary'} sx={{mr:2}}>{torrents.en['1080p'].filesize}</Label>
            </Box>
          <LoadingButton
            variant={'contained'}
            startIcon={<Iconify icon="mynaui:magnet" sx={{ width: 20, height: 20 }} />}
            onClick={ () => downloadTorrent( `/api/download?url=${torrents.en['1080p'].url}`, `${title}.torrent`)}
            loading={loading}
            disabled={torrents.en['1080p']==null}
            fullWidth={!isDesktop}
          >
            1080p
          </LoadingButton>
          </Stack>

          <Stack direction={isDesktop?'row':'column'} alignItems={'center'} justifyContent={'space-between'}>
            <Box sx={{mb:3,}}>
              <Label variant={'filled'} color={'warning'} sx={{mr:2}}>{torrents.en['720p']?torrents.en['720p'].seed:'none'} seeders</Label>
              <Label variant={'filled'} color={'error'} sx={{mr:2}}>{torrents.en['720p']?torrents.en['720p'].peer:'none'} leechers</Label>
              <Label variant={'filled'} color={'secondary'} sx={{mr:2}}>{torrents.en['720p']?torrents.en['720p'].filesize:'none'}</Label>
            </Box>
            <LoadingButton
              variant={'contained'}
              startIcon={<Iconify
                icon="mynaui:magnet"
                sx={{ width: 20, height: 20 }} />}
              onClick={ () => downloadTorrent( `/api/download?url=${torrents.en['720p'].url}`, `${title}.torrent`)}
              loading={loading}
              disabled={torrents.en['720p']==null}
              fullWidth={!isDesktop}
            >
              720p
            </LoadingButton>
          </Stack>
          </>
        }
      </Box>
    </>
  );
}
