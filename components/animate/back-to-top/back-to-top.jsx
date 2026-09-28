import { useRef, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

import Fab from '@mui/material/Fab';

import { Iconify } from 'components/iconify';

// ----------------------------------------------------------------------

export function BackToTop({ value = 90, sx, ...other }) {
  const { scrollYProgress } = useScroll();

  const [show, setShow] = useState(false);
  const showRef = useRef(false);

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const isEnd = Math.floor(latest * 100) > value; // unit is %
    if (showRef.current !== isEnd) {
      showRef.current = isEnd;
      setShow(isEnd);
    }
  });

  return (
    <Fab
      aria-label="Back to top"
      onClick={backToTop}
      sx={{
        width: 48,
        height: 48,
        position: 'fixed',
        transform: 'scale(0) translateZ(0)',
        right: { xs: 24, md: 32 },
        bottom: { xs: 'calc(76px + env(safe-area-inset-bottom, 0px))', md: 32 },
        zIndex: (theme) => theme.zIndex.speedDial,
        transition: (theme) => theme.transitions.create(['transform'], {
          duration: theme.transitions.duration.shorter,
        }),
        willChange: 'transform',
        ...(show && { transform: 'scale(1) translateZ(0)' }),
        ...sx,
      }}
      {...other}
    >
      <Iconify width={24} icon="solar:double-alt-arrow-up-bold-duotone" />
    </Fab>
  );
}
