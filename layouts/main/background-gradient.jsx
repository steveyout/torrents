'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { varAlpha } from '@/theme/styles';

// ----------------------------------------------------------------------

export function BackgroundGradient() {
  const theme = useTheme();

  const { primary, secondary, info } = theme.vars.palette;

  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
        contain: 'strict',
        opacity: 0.65,
        background: `
          radial-gradient(circle 650px at 15% 10%, ${varAlpha(primary.mainChannel, 0.16)}, transparent 65%),
          radial-gradient(circle 700px at 85% 25%, ${varAlpha(secondary.mainChannel, 0.12)}, transparent 65%),
          radial-gradient(circle 600px at 50% 85%, ${varAlpha(info.mainChannel, 0.1)}, transparent 65%)
        `,
      }}
    />
  );
}
