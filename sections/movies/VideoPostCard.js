import PropTypes from 'prop-types';
import { paramCase } from 'change-case';
// next
import NextLink from 'next/link';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Card, Typography, CardContent, Link, Stack } from '@mui/material';
import Avatar from '@/components/Avatar';
// routes
import { PATH_PAGE } from '@/routes/paths';
// hooks
import useResponsive from '@/hooks/useResponsive';
import { useRouter } from 'next/router';
// utils
import { fDate } from '@/utils/formatTime';
import { fShortenNumber } from '@/utils/formatNumber';
// components
import Image from '@/components/Image';
import Iconify from '@/components/Iconify';
import TextMaxLine from '@/components/TextMaxLine';
import SvgIconStyle from '@/components/SvgIconStyle';
import TextIconLabel from '@/components/TextIconLabel';
import stc from 'string-to-color';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import createAvatar from '@/utils/createAvatar';
import useAuth from '@/hooks/useAuth';
import Label from '@/components/Label';

// ----------------------------------------------------------------------

const OverlayStyle = styled('div')(({ theme }) => ({
  top: 0,
  zIndex: 1,
  width: '100%',
  height: '100%',
  position: 'absolute',
  backgroundColor: alpha(theme.palette.grey[900], 0.8),
}));

// ----------------------------------------------------------------------

VideoPostCard.propTypes = {
  video: PropTypes.object.isRequired,
  index: PropTypes.number,
  status: PropTypes.string,
};

export default function VideoPostCard({ video, index, status }) {
  const isDesktop = useResponsive('up', 'md');
  const {  _id,
    imdb_id,
    tmdb_id,
    title,
    year,
    original_language,
    exist_translations,
    contextLocale,
    synopsis, runtime,
    released,
    certification,
    torrents,
    trailer,
    genres,
    images,
    rating} = video;

  const latestPost = index === 0 || index === 1 || index === 2 || index === 3;

  if (isDesktop && latestPost) {
    return (
      <Card>
        <Avatar
          alt={typeof title === 'object'?title.english:title}
          src={images.fanart}
          sx={{
            zIndex: 9,
            top: 24,
            left: 24,
            width: 40,
            height: 40,
            position: 'absolute',
          }}
        />
        <PostContent
          title={title}
          views={rating.watching}
          votes={rating.votes}
          loved={rating.loved}
          hated={rating.hated}
          createdAt={year}
          slug={_id}
          index={index}
        />
        <OverlayStyle />
        <Image alt="cover" src={images && images.poster} sx={{ height: 360 }} />
      </Card>
    );
  }

  return (
    <Card>
      <Box sx={{ position: 'relative' }}>
        {status && (
          <Label
            variant="filled"
            color={(status === 'live' && 'error') || 'info'}
            sx={{
              top: 16,
              right: 16,
              zIndex: 9,
              position: 'absolute',
              textTransform: 'uppercase',
            }}
          >
            {status}
          </Label>
        )}
        <SvgIconStyle
          src="/icons/shape-avatar.svg"
          sx={{
            width: 80,
            height: 36,
            zIndex: 9,
            bottom: -15,
            position: 'absolute',
            color: 'background.paper',
          }}
        />
        <Avatar
          alt={typeof title === 'object'?title.english:title}
          src={images.fanart}
          color={images ? 'default' : createAvatar(title ).color}
          sx={{
            left: 24,
            zIndex: 9,
            width: 32,
            height: 32,
            bottom: -16,
            position: 'absolute',
          }}
        />
        <Image alt="cover" src={`${images.poster}`} ratio="4/3" />
      </Box>

      <PostContent
        title={title}
        views={rating.watching}
        votes={rating.votes}
        loved={rating.loved}
        hated={rating.hated}
        createdAt={year}
        slug={_id}
        index={index}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

PostContent.propTypes = {
  title:PropTypes.string,
  views:PropTypes.number,
  votes:PropTypes.number,
  loved:PropTypes.number,
  hated:PropTypes.number,
  createdAt:PropTypes.string,
  slug:PropTypes.string,
  index:PropTypes.number
};

export function PostContent({ title, views, votes, loved, createdAt, slug, index,hated }) {
  const isDesktop = useResponsive('up', 'md');
  const linkTo = PATH_PAGE.movie(`${paramCase(title)}?imdb_id=${slug}`);
  const latestPostLarge = index === 0;
  const latestPostSmall = index === 1 || index === 2 || index === 3;

  const POST_INFO = [
    { number: views, icon: 'ic:outline-remove-red-eye' },
    { number: votes, icon: 'solar:like-broken' },
    { number: loved, icon: 'ph:heart' },
    { number: hated, icon: 'clarity:heart-broken-line' },
  ];

  return (
    <CardContent
      sx={{
        pt: 4.5,
        width: 1,
        ...((latestPostLarge || latestPostSmall) && {
          pt: 0,
          zIndex: 9,
          bottom: 0,
          position: 'absolute',
          color: 'common.white',
        }),
      }}
    >
      <Typography
        gutterBottom
        variant="caption"
        component="div"
        sx={{
          color: 'text.disabled',
          ...((latestPostLarge || latestPostSmall) && {
            opacity: 0.64,
            color: 'common.white',
          }),
        }}
      >
        {createdAt}
      </Typography>

      <NextLink href={linkTo} passHref>
        <Link color="inherit">
          <TextMaxLine
            variant={'subtitle2'}
            line={2}
            persistent
          >
            {title}
          </TextMaxLine>
        </Link>
      </NextLink>

      <Stack
        flexWrap="wrap"
        direction="row"
        justifyContent="space-evenly"
        sx={{
          mt: 3,
          color: 'text.disabled',
          ...((latestPostLarge || latestPostSmall) && {
            opacity: 0.64,
            color: 'common.white',
          }),
        }}
      >
        {POST_INFO.map((info, index) => (
          <TextIconLabel
            key={index}
            icon={<Iconify icon={info.icon} sx={{ width: 16, height: 16, mr: 0.5 }} />}
            value={fShortenNumber(info.number)}
            sx={{ typography: 'caption', ml: index === 0 ? 0 : 1.5 }}
          />
        ))}
      </Stack>
    </CardContent>
  );
}
