import { paper, varAlpha } from '@/theme/styles';
import { usePathname } from '@/routes/hooks';
import { NavLi, NavUl } from '@/components/nav-section';
import { useActiveLink } from '@/routes/hooks/use-active-link';
import { useRef, useState, useEffect, useCallback } from 'react';
import { isExternalLink, removeLastSlash } from '@/routes/utils';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Stack from '@mui/material/Stack';
import Portal from '@mui/material/Portal';
import { useTheme } from '@mui/material/styles';
import ListSubheader from '@mui/material/ListSubheader';

import { NavItem, NavItemDashboard } from './nav-desktop-item';

// ----------------------------------------------------------------------

export function NavList({ data }) {
  const theme = useTheme();

  const navItemRef = useRef(null);

  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState(false);

  const active = useActiveLink(data.path, !!data.children);

  const [clientRect, setClientRect] = useState({ top: 0, height: 0 });

  useEffect(() => {
    if (openMenu) {
      handleCloseMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleOpenMenu = useCallback(() => {
    if (data.children) {
      setOpenMenu(true);
    }
  }, [data.children]);

  const handleCloseMenu = useCallback(() => {
    setOpenMenu(false);
  }, []);

  const renderNavItem = (
    <NavItem
      ref={navItemRef}
      // slots
      title={data.title}
      path={data.path}
      // state
      active={active}
      hasChild={!!data.children}
      open={data.children && !!openMenu}
      externalLink={isExternalLink(data.path)}
      // action
      onMouseEnter={handleOpenMenu}
      onMouseLeave={handleCloseMenu}
    />
  );

  const handleGetClientRect = useCallback(() => {
    const element = navItemRef.current;

    if (element) {
      const rect = element.getBoundingClientRect();
      setClientRect({ top: rect.top, height: rect.height });
    }
  }, []);

  useEffect(() => {
    handleGetClientRect();

    window.addEventListener('scroll', handleGetClientRect);

    return () => {
      window.removeEventListener('scroll', handleGetClientRect);
    };
  }, [handleGetClientRect]);

  if (data.children) {
    return (
      <NavLi sx={{ height: 1 }}>
        {renderNavItem}

        {openMenu && (
          <Portal>
            <Fade in>
              <Box
                onMouseEnter={handleOpenMenu}
                onMouseLeave={handleCloseMenu}
                sx={{
                  pt: 1,
                  left: 0,
                  right: 0,
                  mx: 'auto',
                  position: 'fixed',
                  zIndex: theme.zIndex.modal,
                  maxWidth: 580,
                  top: Math.round(clientRect.top + clientRect.height),
                }}
              >
                <Box
                  component="nav"
                  sx={{
                    ...paper({ theme, dropdown: true }),
                    borderRadius: 2.5,
                    p: theme.spacing(3, 3.5, 3, 3.5),
                    backdropFilter: 'blur(24px)',
                    border: (theme) => `1px solid ${varAlpha(theme.vars.palette.divider, 0.12)}`,
                    boxShadow: (theme) =>
                      `0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px ${varAlpha(
                        theme.vars.palette.primary.mainChannel,
                        0.1
                      )}`,
                  }}
                >
                  <NavUl
                    sx={{
                      gap: 3,
                      width: 1,
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    }}
                  >
                    {data.children.map((list) => (
                      <NavSubList
                        key={list.subheader}
                        subheader={list.subheader}
                        data={list.items}
                      />
                    ))}
                  </NavUl>
                </Box>
              </Box>
            </Fade>
          </Portal>
        )}
      </NavLi>
    );
  }

  return <NavLi sx={{ height: 1 }}>{renderNavItem}</NavLi>;
}

// ----------------------------------------------------------------------

function NavSubList({ data, subheader, sx, ...other }) {
  const pathname = usePathname();

  const isDashboard = subheader === 'Dashboard';

  return (
    <Stack
      component={NavLi}
      alignItems="flex-start"
      sx={{
        flex: '1 1 auto',
        ...(isDashboard && { maxWidth: { md: 1 / 3, lg: 540 } }),
        ...sx,
      }}
      {...other}
    >
      <NavUl sx={{ width: 1 }}>
        <ListSubheader
          disableSticky
          disableGutters
          sx={{
            fontSize: 11,
            color: 'primary.main',
            fontWeight: 800,
            letterSpacing: 1.1,
            typography: 'overline',
            px: 0,
            mb: 0.5,
          }}
        >
          {subheader}
        </ListSubheader>

        {data.map((item) =>
          isDashboard ? (
            <NavLi key={item.title} sx={{ mt: 1.5 }}>
              <NavItemDashboard path={item.path} />
            </NavLi>
          ) : (
            <NavLi key={item.title} sx={{ mt: 1 }}>
              <NavItem
                subItem
                title={item.title}
                path={item.path}
                active={item.path === pathname || (item.path !== '/' && pathname.startsWith(item.path))}
              />
            </NavLi>
          )
        )}
      </NavUl>
    </Stack>
  );
}
