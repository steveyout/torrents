'use client';

import Stack from '@mui/material/Stack';
import { AdUnit } from './ad-unit';

// ----------------------------------------------------------------------

/**
 * Renders two half-skyscraper ads side-by-side or stacked on mobile.
 */
export function AdPair({ sx = {} }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ my: 3, ...sx }}
    >
      <AdUnit variant="halfSkyscraper" sx={{ my: 0 }} />
      <AdUnit variant="halfSkyscraper" sx={{ my: 0 }} />
    </Stack>
  );
}
