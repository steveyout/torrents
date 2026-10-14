'use client';

import Box from '@mui/material/Box';
import { AdUnit } from './ad-unit';

// ----------------------------------------------------------------------

/**
 * Fixed left and right skyscraper side rails for widescreen displays.
 * Only rendered on screens wider than 1620px to prevent overlapping content.
 */
export function AdSideRails({ offsetTop = 100 }) {
  return (
    <Box
      sx={{
        display: { xs: 'none', xl: 'block' },
        '@media (max-width: 1620px)': {
          display: 'none !important',
        },
      }}
    >
      {/* Left 160x600 Rail */}
      <Box
        sx={{
          position: 'fixed',
          left: 12,
          top: offsetTop,
          zIndex: 40,
          pointerEvents: 'auto',
        }}
      >
        <AdUnit variant="skyscraper" showLabel={false} sx={{ my: 0 }} />
      </Box>

      {/* Right 160x600 Rail */}
      <Box
        sx={{
          position: 'fixed',
          right: 12,
          top: offsetTop,
          zIndex: 40,
          pointerEvents: 'auto',
        }}
      >
        <AdUnit variant="skyscraper" showLabel={false} sx={{ my: 0 }} />
      </Box>
    </Box>
  );
}
