'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paths } from '@/routes/paths';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTvFocus } from './tv-focus-context';

// ----------------------------------------------------------------------

const getPosterUrl = (path) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : '/assets/placeholder.jpg';

export function TvCard({ post, rowIndex, colIndex }) {
  const router = useRouter();
  const { focusRow, focusCol } = useTvFocus();
  const cardRef = useRef(null);
  const { elementRef, inView } = useScrollReveal();

  const isFocused = focusRow === rowIndex && focusCol === colIndex;

  const displayTitle = post.title || post.name || 'Untitled';
  const displayDate = post.first_air_date || post.release_date;
  const releaseYear = displayDate ? new Date(displayDate).getFullYear() : null;
  const type = post.media_type || (post.release_date ? 'movie' : 'tv');
  const linkTo = paths.watch.details(type, post.id, displayTitle);

  // Auto-scroll focused card into view
  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [isFocused]);

  // Handle Enter key
  useEffect(() => {
    if (!isFocused) return;

    const handleKey = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        router.push(linkTo);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFocused, linkTo, router]);

  return (
    <Box
      ref={elementRef}
      className="youplex-scroll-reveal"
      sx={{
        flexShrink: 0,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate3d(0, 0, 0)' : 'translate3d(0, 20px, 0)',
        transition: 'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${(colIndex % 6) * 45}ms`,
        willChange: inView ? 'auto' : 'transform, opacity',
      }}
    >
      <Box
        ref={cardRef}
        sx={{
          width: { xs: 160, md: 200 },
          cursor: 'pointer',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          borderRadius: 2,
          overflow: 'hidden',
          outline: 'none',
          position: 'relative',
          ...(isFocused && {
            transform: 'scale(1.12)',
            zIndex: 10,
            boxShadow: '0 0 0 3px #00e676, 0 8px 40px rgba(0,230,118,0.35)',
          }),
        }}
        onClick={() => router.push(linkTo)}
      >
        <Box
          component="img"
          src={getPosterUrl(post.poster_path)}
          alt={displayTitle}
          sx={{
            width: '100%',
            aspectRatio: '2/3',
            objectFit: 'cover',
            display: 'block',
            borderRadius: 2,
          }}
        />

        <Typography
          variant="subtitle2"
          noWrap
          sx={{
            mt: 1,
            px: 0.5,
            color: isFocused ? '#00e676' : 'grey.300',
            fontSize: { xs: '0.85rem', md: '1rem' },
            fontWeight: isFocused ? 700 : 500,
            transition: 'color 0.2s ease',
          }}
        >
          {displayTitle}
        </Typography>

        {releaseYear && (
          <Typography
            variant="caption"
            sx={{
              px: 0.5,
              color: isFocused ? 'common.white' : 'text.disabled',
              fontSize: '0.75rem',
              display: 'block',
            }}
          >
            {releaseYear}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
