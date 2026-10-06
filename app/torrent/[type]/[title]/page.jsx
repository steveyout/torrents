'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fDate } from '@/utils/format-time';
import { paramCase } from '@/utils/change-case';
import { Iconify } from '@/components/iconify';
import { Label } from '@/components/label';
import { PostItem } from '@/sections/movies/post-item';
import { TorrentTable } from '@/components/torrents';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getMovieOrShow, getRecommendations } from '@/actions/api';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { alpha, useTheme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

export default function TorrentDetailPage() {
  const theme = useTheme();
  const router = useRouter();
  const { type, title: titleSlug } = useParams();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const initialSeason = searchParams.get('season') || searchParams.get('sn');
  const initialEpisode = searchParams.get('episode') || searchParams.get('ep');

  const [movieOrShow, setMovieOrShow] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // TV Season / Episode selection
  const [selectedSeason, setSelectedSeason] = useState(Number(initialSeason) || 1);
  const [selectedEpisode, setSelectedEpisode] = useState(Number(initialEpisode) || 1);

  // Torrents state
  const [torrents, setTorrents] = useState([]);
  const [torrentsLoading, setTorrentsLoading] = useState(false);
  const [torrentsError, setTorrentsError] = useState(null);
  const [customQuery, setCustomQuery] = useState('');

  // Fetch TMDB Metadata
  useEffect(() => {
    let active = true;

    if (!id) {
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    getMovieOrShow(type, id)
      .then((data) => {
        if (active) {
          setMovieOrShow(data);
          const firstSeason = data?.seasons?.find((s) => s.season_number > 0);
          if (firstSeason && !initialSeason) {
            setSelectedSeason(firstSeason.season_number);
          }
        }
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Something went wrong while loading this title.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    getRecommendations(type, id)
      .then((data) => {
        if (active) setRecommendations(data?.results || []);
      })
      .catch(() => {
        if (active) setRecommendations([]);
      });

    return () => {
      active = false;
    };
  }, [type, id, initialSeason]);

  // Fetch Torrents from Jackett API
  const fetchJackettTorrents = useCallback(
    async (searchTerm) => {
      if (!searchTerm) return;
      setTorrentsLoading(true);
      setTorrentsError(null);

      try {
        const isTv = type === 'tv';
        const params = new URLSearchParams({
          q: searchTerm,
          category: isTv ? 'tv' : 'movies',
        });

        if (isTv) {
          params.set('season', String(selectedSeason));
          params.set('ep', String(selectedEpisode));
        } else {
          const year = movieOrShow?.release_date
            ? new Date(movieOrShow.release_date).getFullYear()
            : '';
          if (year) params.set('year', String(year));
        }

        const res = await fetch(`/api/torrents?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to retrieve torrents');
        const data = await res.json();

        setTorrents(data.torrents || []);
      } catch (err) {
        console.error('Torrent fetch error:', err);
        setTorrentsError(err.message || 'Unable to connect to torrent indexers');
      } finally {
        setTorrentsLoading(false);
      }
    },
    [type, selectedSeason, selectedEpisode, movieOrShow]
  );

  // Trigger torrent search when media or season/ep changes
  useEffect(() => {
    const rawTitle = movieOrShow?.title || movieOrShow?.name;
    if (rawTitle) {
      fetchJackettTorrents(customQuery || rawTitle);
    }
  }, [movieOrShow, selectedSeason, selectedEpisode, fetchJackettTorrents, customQuery]);

  if (isLoading) return <DetailSkeleton />;
  if (error || !movieOrShow) return <DetailError error={error} title={titleSlug} />;

  const isTv = type === 'tv';
  const displayTitle = movieOrShow.title || movieOrShow.name || '';
  const releaseDate = movieOrShow.release_date || movieOrShow.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const rating = movieOrShow.vote_average || 0;
  const { runtime } = movieOrShow;
  const runtimeLabel = runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : null;
  const genres = movieOrShow.genres || [];
  const cast = movieOrShow.credits?.cast?.slice(0, 8) || [];

  const backdrop = movieOrShow.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movieOrShow.backdrop_path}`
    : '';
  const poster = movieOrShow.poster_path
    ? `https://image.tmdb.org/t/p/w400${movieOrShow.poster_path}`
    : '';

  const seasons = movieOrShow.seasons?.filter((s) => s.season_number > 0) || [];
  const currentSeasonData = seasons.find((s) => s.season_number === selectedSeason);
  const totalEpisodes = currentSeasonData?.episode_count || 0;

  // Stream URL to youplex.site
  const streamType = isTv ? 'tv' : 'movie';
  const slug = titleSlug || (displayTitle ? paramCase(displayTitle) : 'watch');
  const streamBaseUrl = `https://youplex.site/watch/${streamType}/${slug}/play?id=${id}`;
  const streamUrl = isTv
    ? `${streamBaseUrl}&season=${selectedSeason}&episode=${selectedEpisode}`
    : streamBaseUrl;

  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      {/* Hero Header */}
      <Box sx={{ position: 'relative', overflow: 'hidden', pt: { xs: 2, md: 6 }, pb: { xs: 4, md: 6 } }}>
        {backdrop && (
          <Box
            component="img"
            src={backdrop}
            alt=""
            sx={{
              position: 'absolute',
              inset: 0,
              width: 1,
              height: 1,
              objectFit: 'cover',
              filter: 'brightness(0.35)',
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(10,12,16,0.3) 0%, rgba(10,12,16,0.96) 100%)',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 2, md: 4 } }}>
            <Button
              size="small"
              startIcon={<Iconify icon="solar:alt-arrow-left-bold" width={16} />}
              onClick={() => router.back()}
              sx={{
                color: 'common.white',
                bgcolor: alpha('#ffffff', 0.12),
                backdropFilter: 'blur(8px)',
                border: 'solid 1px',
                borderColor: alpha('#ffffff', 0.16),
                '&:hover': { bgcolor: alpha('#ffffff', 0.22) },
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Back
            </Button>

            {/* Stream Now button in header bar */}
            <Button
              component="a"
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Iconify icon="solar:play-circle-bold" width={20} />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                px: 2,
              }}
            >
              Stream on Youplex
            </Button>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 3, sm: 4, md: 5 }}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
          >
            {poster && (
              <Box
                component="img"
                src={poster}
                alt={displayTitle}
                sx={{
                  width: { xs: 180, sm: 220, md: 260 },
                  flexShrink: 0,
                  borderRadius: 3,
                  boxShadow: `0 24px 48px -12px ${alpha('#000000', 0.8)}`,
                  border: `solid 1px ${alpha(theme.palette.common.white, 0.15)}`,
                }}
              />
            )}

            <Stack spacing={2} sx={{ width: 1, minWidth: 0, color: 'common.white' }}>
              {/* Badges Row using Material UI Label & Chip components */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Label variant="filled" color="primary">
                  {isTv ? 'TV Series' : 'Movie'}
                </Label>

                {rating > 0 && (
                  <Label
                    variant="filled"
                    color={(rating >= 7 && 'success') || (rating >= 5 && 'warning') || 'error'}
                    startIcon={<Iconify icon="solar:star-bold" width={13} />}
                  >
                    {rating.toFixed(1)}
                  </Label>
                )}

                {releaseYear && (
                  <Label variant="filled" color="default">
                    {releaseYear}
                  </Label>
                )}

                {movieOrShow.status && (
                  <Label variant="soft" color="info">
                    {movieOrShow.status}
                  </Label>
                )}
              </Stack>

              <Typography variant="h2" sx={{ fontSize: { xs: 32, sm: 44, md: 54 }, fontWeight: 800 }}>
                {displayTitle}
              </Typography>

              <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={2} useFlexGap>
                {releaseDate && (
                  <MetaItem icon="solar:calendar-mark-bold" label={fDate(releaseDate)} />
                )}
                {runtimeLabel && <MetaItem icon="solar:clock-circle-bold" label={runtimeLabel} />}
                {isTv && movieOrShow.number_of_seasons > 0 && (
                  <MetaItem
                    icon="solar:layers-bold"
                    label={`${movieOrShow.number_of_seasons} season${movieOrShow.number_of_seasons > 1 ? 's' : ''}`}
                  />
                )}
              </Stack>

              {movieOrShow.overview && (
                <Typography
                  variant="body1"
                  sx={{ color: alpha('#ffffff', 0.8), lineHeight: 1.7, maxWidth: 800 }}
                >
                  {movieOrShow.overview}
                </Typography>
              )}

              {/* Genres using Material UI Chip components */}
              {genres.length > 0 && (
                <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                  {genres.map((genre) => (
                    <Chip
                      key={genre.id}
                      size="small"
                      label={genre.name}
                      variant="soft"
                    />
                  ))}
                </Stack>
              )}

              {/* Stream CTA Button */}
              <Box sx={{ pt: 1.5 }}>
                <Button
                  component="a"
                  href={streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<Iconify icon="solar:play-bold" width={22} />}
                  sx={{
                    px: 3.5,
                    py: 1.25,
                    borderRadius: 2,
                    fontWeight: 800,
                    fontSize: '1rem',
                    textTransform: 'none',
                    width: { xs: 1, sm: 'auto' },
                  }}
                >
                  {isTv ? `Stream S${selectedSeason}E${selectedEpisode} on Youplex` : 'Stream Now on Youplex'}
                </Button>
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Stack spacing={4}>
          {/* TV Season & Episode Selector */}
          {isTv && seasons.length > 0 && (
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` }}>
              <CardHeader
                title={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:layers-bold" width={22} sx={{ color: 'primary.main' }} />
                    <Typography variant="h6">Select Season & Episode</Typography>
                  </Stack>
                }
                action={
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Button
                      component="a"
                      href={streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      variant="soft"
                      color="primary"
                      startIcon={<Iconify icon="solar:play-circle-bold" width={18} />}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Stream S{selectedSeason}E{selectedEpisode}
                    </Button>
                    <TextField
                      select
                      size="small"
                      value={selectedSeason}
                      onChange={(e) => {
                        setSelectedSeason(Number(e.target.value));
                        setSelectedEpisode(1);
                      }}
                      sx={{ minWidth: 140 }}
                    >
                      {seasons.map((s) => (
                        <MenuItem key={s.id} value={s.season_number}>
                          Season {s.season_number}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                }
                sx={{ pb: 1 }}
              />
              <CardContent>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  Choose episode to filter available torrents:
                </Typography>
                <Box
                  display="grid"
                  gap={1}
                  gridTemplateColumns={{
                    xs: 'repeat(4, 1fr)',
                    sm: 'repeat(6, 1fr)',
                    md: 'repeat(8, 1fr)',
                    lg: 'repeat(12, 1fr)',
                  }}
                >
                  {[...Array(totalEpisodes)].map((_, index) => {
                    const epNum = index + 1;
                    const isSelected = epNum === selectedEpisode;
                    return (
                      <Button
                        key={epNum}
                        variant={isSelected ? 'contained' : 'outlined'}
                        color={isSelected ? 'primary' : 'inherit'}
                        onClick={() => setSelectedEpisode(epNum)}
                        sx={{
                          minWidth: 0,
                          py: 0.75,
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 500,
                        }}
                      >
                        EP {epNum}
                      </Button>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Torrents Table Section */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:magnet-bold" width={26} sx={{ color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={700}>
                  {isTv
                    ? `Torrents for S${String(selectedSeason).padStart(2, '0')}E${String(selectedEpisode).padStart(2, '0')}`
                    : `Torrents for ${displayTitle}`}
                </Typography>
              </Stack>

              <Button
                size="small"
                variant="soft"
                color="inherit"
                startIcon={<Iconify icon="solar:refresh-bold" width={16} />}
                onClick={() => fetchJackettTorrents(customQuery || displayTitle)}
                disabled={torrentsLoading}
              >
                Refresh
              </Button>
            </Stack>

            <TorrentTable
              torrents={torrents}
              title={
                isTv
                  ? `${displayTitle} S${String(selectedSeason).padStart(2, '0')}E${String(selectedEpisode).padStart(2, '0')}`
                  : displayTitle
              }
              isLoading={torrentsLoading}
              error={torrentsError}
            />
          </Box>

          {/* Cast Section */}
          {cast.length > 0 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Top Cast
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={2} useFlexGap>
                {cast.map((actor) => (
                  <Stack
                    key={actor.id}
                    alignItems="center"
                    spacing={1}
                    sx={{ width: 110, textAlign: 'center' }}
                  >
                    <Box
                      component="img"
                      src={
                        actor.profile_path
                          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                          : '/assets/placeholder.jpg'
                      }
                      alt={actor.name}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `solid 1px ${theme.palette.divider}`,
                      }}
                    />
                    <Stack>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                        {actor.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
                        {actor.character}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 700 }}>
                You May Also Like
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                    lg: 'repeat(6, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {recommendations.slice(0, 12).map((post, index) => (
                  <PostItem key={post.id} post={post} index={index} />
                ))}
              </Box>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

function MetaItem({ icon, label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.6} sx={{ color: alpha('#ffffff', 0.85) }}>
      <Iconify icon={icon} width={18} sx={{ color: alpha('#ffffff', 0.6) }} />
      <Typography variant="subtitle2" sx={{ color: 'common.white' }}>
        {label}
      </Typography>
    </Stack>
  );
}

function DetailSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Stack direction="row" spacing={3}>
          <Skeleton variant="rounded" sx={{ width: 240, height: 360, display: { xs: 'none', sm: 'block' } }} />
          <Stack spacing={2} sx={{ width: 1 }}>
            <Skeleton width="40%" height={32} />
            <Skeleton width="75%" height={60} />
            <Skeleton width="50%" height={24} />
            <Skeleton width="90%" height={80} />
          </Stack>
        </Stack>
        <Skeleton variant="rounded" sx={{ width: 1, height: 300 }} />
      </Stack>
    </Container>
  );
}

function DetailError({ error }) {
  return (
    <Container sx={{ py: 12, textAlign: 'center' }}>
      <Stack alignItems="center" spacing={2} sx={{ maxWidth: 400, mx: 'auto' }}>
        <Iconify icon="solar:shield-warning-bold" width={56} sx={{ color: 'error.main' }} />
        <Typography variant="h5">Could not load title</Typography>
        <Typography variant="body2" color="text.secondary">
          {error || 'The requested title could not be loaded.'}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Stack>
    </Container>
  );
}
