'use client';

import { paths } from '@/routes/paths';
import { usePathname } from '@/routes/hooks';
import { Iconify } from '@/components/iconify';
import { RouterLink } from '@/routes/components';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme, alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  { key: 'home', title: 'Home', path: '/', icon: 'solar:home-2-bold-duotone', activeIcon: 'solar:home-2-bold' },
  { key: 'search', title: 'Search', path: paths.search, icon: 'solar:magnifer-bold-duotone', activeIcon: 'solar:magnifer-bold' },
  { key: 'movies', title: 'Movies', path: paths.movies, icon: 'solar:clapperboard-bold-duotone', activeIcon: 'solar:clapperboard-bold' },
  { key: 'tv', title: 'Shows', path: paths.tv, icon: 'solar:tv-bold-duotone', activeIcon: 'solar:tv-bold' },
  { key: 'games', title: 'Games', path: paths.games, icon: 'solar:gamepad-bold-duotone', activeIcon: 'solar:gamepad-bold' },
];

// ----------------------------------------------------------------------

export function BottomNav({ sx }) {
  const theme = useTheme();
  const pathname = usePathname();

  return (
    <Box
      component="nav"
      aria-label="Mobile Navigation"
      data-slot="bottom-nav"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1100,
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        justifyContent: 'space-around',
        bgcolor: alpha(theme.palette.background.paper, 0.94),
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: `0 -4px 16px ${alpha(theme.palette.common.black, 0.12)}`,
        pt: 0.75,
        pb: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
        px: 1,
        touchAction: 'manipulation',
        ...sx,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isItemActive(pathname, item);

        return (
          <ButtonBase
            key={item.key}
            component={RouterLink}
            href={item.path}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              py: 0.5,
              px: 0.5,
              borderRadius: 2,
              color: active ? 'primary.main' : 'text.secondary',
              transition: theme.transitions.create(['color', 'background-color'], {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                bgcolor: alpha(theme.palette.text.primary, 0.04),
              },
            }}
          >
            {/* Material Design 3 Active Pill Indicator */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 32,
                borderRadius: 16,
                mb: 0.35,
                bgcolor: active
                  ? alpha(theme.palette.primary.main, 0.18)
                  : 'transparent',
                transition: theme.transitions.create(['background-color', 'transform'], {
                  duration: theme.transitions.duration.short,
                }),
                ...(active && {
                  transform: 'scale(1)',
                }),
              }}
            >
              <Iconify
                icon={active ? (item.activeIcon || item.icon) : item.icon}
                width={22}
                sx={{
                  color: active ? 'primary.main' : 'text.secondary',
                  transition: theme.transitions.create(['color', 'transform'], {
                    duration: theme.transitions.duration.shorter,
                  }),
                }}
              />
            </Box>

            {/* Label */}
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.68rem',
                fontWeight: active ? 700 : 500,
                lineHeight: 1.2,
                letterSpacing: active ? 0.3 : 0.2,
                color: active ? 'primary.main' : 'text.secondary',
                transition: theme.transitions.create(['color', 'font-weight'], {
                  duration: theme.transitions.duration.shorter,
                }),
              }}
            >
              {item.title}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

// ----------------------------------------------------------------------

function isItemActive(pathname, item) {
  if (item.key === 'home') {
    return pathname === '/';
  }

  if (item.key === 'search') {
    return pathname === '/search' || pathname.startsWith('/search');
  }

  if (item.key === 'movies') {
    if (pathname.startsWith('/torrent/movie/') || pathname.startsWith('/watch/movie/')) return true;
    return pathname === '/movies' || pathname.startsWith('/movies/');
  }

  if (item.key === 'tv') {
    if (pathname.startsWith('/torrent/tv/') || pathname.startsWith('/watch/tv/')) return true;
    return pathname === '/tv' || pathname.startsWith('/tv/');
  }

  if (item.key === 'games') {
    return pathname === '/games' || pathname.startsWith('/games');
  }

  return false;
}

