'use client';

import Box from '@mui/material/Box';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

// ----------------------------------------------------------------------

export function ScrollReveal({
  children,
  index = 0,
  delay,
  duration = 0.48,
  distance = 24,
  sx,
  ...other
}) {
  const { elementRef, inView } = useScrollReveal();
  const computedDelay = delay !== undefined ? delay : (index % 6) * 55;

  return (
    <Box
      ref={elementRef}
      className="youplex-scroll-reveal"
      sx={{
        width: '100%',
        height: '100%',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate3d(0, 0, 0)' : `translate3d(0, ${distance}px, 0)`,
        transition: `opacity ${duration}s cubic-bezier(0.22, 1, 0.36, 1), transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
        transitionDelay: `${computedDelay}ms`,
        willChange: inView ? 'auto' : 'transform, opacity',
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}
