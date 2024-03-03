import PropTypes from 'prop-types';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  SpeedDial,
  CircularProgress,
  Typography,
  SpeedDialAction,
  IconButton,
  Stack,
  Slider,
  Menu,
  MenuItem,
  ListItemIcon,
  MenuList,
  ListItemText,
} from '@mui/material';
// hooks
import useResponsive from '@/hooks/useResponsive';
// utils
import { fDate } from '@/utils/formatTime';
// components
import Image from '@/components/Image';
import Iconify from '@/components/Iconify';
import 'moment-duration-format';
import createAvatar from '@/utils/createAvatar';
import Avatar from '@/components/Avatar';

// ----------------------------------------------------------------------

const SOCIALS = [
  {
    name: 'Facebook',
    icon: <Iconify icon="eva:facebook-fill" width={20} height={20} color="#1877F2" />,
  },
  {
    name: 'Instagram',
    icon: <Iconify icon="ant-design:instagram-filled" width={20} height={20} color="#D7336D" />,
  },
  {
    name: 'Linkedin',
    icon: <Iconify icon="eva:linkedin-fill" width={20} height={20} color="#006097" />,
  },
  {
    name: 'Twitter',
    icon: <Iconify icon="eva:twitter-fill" width={20} height={20} color="#1C9CEA" />,
  },
];

const FooterStyle = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  position: 'relative',
  alignItems: 'flex-end',
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  justifyContent: 'space-between',
  [theme.breakpoints.down('sm')]: {
    top: 50,
    height: 10,
    marginBottom: 50,
  },
  [theme.breakpoints.up('lg')]: {
    bottom: 0,
  },
}));

//----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

VideoPostHero.propTypes = {
  post: PropTypes.object.isRequired,
};

export default function VideoPostHero({ post }) {
  const theme = useTheme();
  const isDesktop = useResponsive('up', 'sm');
  const {
    _id,
    imdb_id,
    tmdb_id,
    title,
    year,
    original_language,
    exist_translations,
    contextLocale,
    synopsis,
    runtime,
    released,
    certification,
    torrents,
    trailer,
    genres,
    images,
    rating
  } = post;

  return (
    <>
      <Box
        component="span"
        sx={{
          'width': 1,
          'lineHeight': 0,
          'display': 'block',
          'overflow': 'hidden',
          'position': 'relative',
          'borderRadius': 1,
          '& .wrapper': {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            lineHeight: 0,
            position: 'absolute',
            backgroundSize: 'cover !important',
          },
        }}
      >
        <Image alt="cover" src={`${images.banner}`} ratio="4/3" />
      </Box>
      <FooterStyle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={title}
            src={images.fanart}
            color={images ? 'default' : createAvatar(title).color}
            sx={{ width: 48, height: 48 }}
          />
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1">{title}</Typography>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              {fDate(year)}
            </Typography>
          </Box>
        </Box>

        <SpeedDial
          direction={isDesktop ? 'left' : 'up'}
          ariaLabel="Share post"
          icon={<Iconify icon="eva:share-fill" sx={{ width: 20, height: 20 }} />}
          sx={{ '& .MuiSpeedDial-fab': { width: 48, height: 48 } }}
        >
          {SOCIALS.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipPlacement="top"
              FabProps={{ color: 'default' }}
            />
          ))}
        </SpeedDial>
      </FooterStyle>
    </>
  );
}
