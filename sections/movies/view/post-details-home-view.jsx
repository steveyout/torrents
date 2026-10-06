'use client';

import { useState, useEffect } from 'react';
import { paths } from '@/routes/paths';
import { paramCase } from '@/utils/change-case';
import { useRouter } from '@/routes/hooks';
import { fDate } from '@/utils/format-time';
import { Iconify } from '@/components/iconify';
import { Label } from '@/components/label';
import { RouterLink } from '@/routes/components';
import { CustomBreadcrumbs } from '@/components/custom-breadcrumbs';
import { TorrentTable } from '@/components/torrents';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme, alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { PostItem } from '../post-item';

// ----------------------------------------------------------------------

export function PostDetailsHomeView({ post, latestPosts, videoParams }) {
  const theme = useTheme();
  const router = useRouter();

  const isTv = videoParams.type === 'tv';
  const displayTitle = post?.title || post?.name || '';
  const displayDate = post?.release_date || post?.first_air_date;
  const cast = post?.credits?.cast?.slice(0, 10) || [];

  // Logic for Seasons and Episodes
  const seasons = post?.seasons?.filter((s) => s.season_number > 0) || [];
  const currentSeasonData = post?.seasons?.find((s) => s.season_number === videoParams.season);
  const totalEpisodes = currentSeasonData?.episode_count || 0;

  // Stream URL to youplex.site
  const streamType = isTv ? 'tv' : 'movie';
  const streamSlug = paramCase(displayTitle || 'watch');
  const streamBaseUrl = `https://youplex.site/watch/${streamType}/${streamSlug}/play?id=${videoParams.id}`;
  const streamUrl = isTv
    ? `${streamBaseUrl}&season=${videoParams.season || 1}&episode=${videoParams.episode || 1}`
    : streamBaseUrl;

  // Torrents fetching
  const [torrents, setTorrents] = useState([]);
  const [torrentsLoading, setTorrentsLoading] = useState(true);
  const [torrentsError, setTorrentsError] = useState(null);

  useEffect(() => {
    if (!displayTitle) return;

    let active = true;
    setTorrentsLoading(true);
    setTorrentsError(null);

    const params = new URLSearchParams({
      q: displayTitle,
      category: isTv ? 'tv' : 'movies',
    });

    if (isTv) {
      params.set('season', String(videoParams.season || 1));
      params.set('ep', String(videoParams.episode || 1));
    } else {
      const year = post?.release_date ? new Date(post.release_date).getFullYear() : '';
      if (year) params.set('year', String(year));
    }

    fetch(`/api/torrents?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (active) setTorrents(data.torrents || []);
      })
      .catch((err) => {
        if (active) setTorrentsError(err.message);
      })
      .finally(() => {
        if (active) setTorrentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [displayTitle, isTv, videoParams.season, videoParams.episode, post?.release_date]);

  const handleSeasonChange = (event) => {
    const newSeason = event.target.value;
    const path = paths.torrent.details(videoParams.type, videoParams.id, displayTitle, newSeason, 1);
    router.push(path);
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <CustomBreadcrumbs
          links={[
            { name: 'Home', href: '/' },
            { name: isTv ? 'TV Series' : 'Movies', href: isTv ? '/tv' : '/movies' },
            { name: displayTitle },
          ]}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={{ xs: 3, md: 5 }}>
          <Grid xs={12} md={8}>
            <Stack spacing={3}>
              <Typography variant="h3">{displayTitle}</Typography>

              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                {displayDate && (
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {fDate(displayDate)}
                  </Typography>
                )}

                <Label variant="filled" color="primary">
                  {isTv ? 'TV Series' : 'Movie'}
                </Label>

                {post?.vote_average > 0 && (
                  <Label
                    variant="filled"
                    color={(post.vote_average >= 7 && 'success') || (post.vote_average >= 5 && 'warning') || 'error'}
                    startIcon={<Iconify icon="solar:star-bold" width={13} />}
                  >
                    {post.vote_average.toFixed(1)}
                  </Label>
                )}

                {/* Stream Now button */}
                <Button
                  component="a"
                  href={streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Iconify icon="solar:play-circle-bold" width={18} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 1.5,
                    px: 2,
                    boxShadow: (th) => `0 6px 18px ${alpha(th.palette.primary.main, 0.4)}`,
                  }}
                >
                  Stream Now
                </Button>
              </Stack>

              {/* Season & Episode Selector */}
              {isTv && seasons.length > 0 && (
                <Card sx={{ bgcolor: 'background.neutral', border: `1px solid ${theme.palette.divider}` }}>
                  <CardHeader
                    title="Episodes"
                    sx={{ pb: 0 }}
                    action={
                      <TextField
                        select
                        size="small"
                        value={videoParams.season}
                        onChange={handleSeasonChange}
                        SelectProps={{ sx: { typography: 'subtitle2' } }}
                        sx={{ minWidth: 120 }}
                      >
                        {seasons.map((season) => (
                          <MenuItem key={season.id} value={season.season_number}>
                            Season {season.season_number}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                  />
                  <CardContent>
                    <Box
                      display="grid"
                      gap={1}
                      gridTemplateColumns={{
                        xs: 'repeat(4, 1fr)',
                        sm: 'repeat(6, 1fr)',
                        md: 'repeat(8, 1fr)',
                        lg: 'repeat(10, 1fr)',
                      }}
                    >
                      {[...Array(totalEpisodes)].map((_, index) => {
                        const epNumber = index + 1;
                        const isSelected = epNumber === videoParams.episode;

                        return (
                          <Button
                            key={epNumber}
                            component={RouterLink}
                            href={paths.torrent.details(
                              videoParams.type,
                              videoParams.id,
                              displayTitle,
                              videoParams.season,
                              epNumber
                            )}
                            variant={isSelected ? 'contained' : 'soft'}
                            color={isSelected ? 'primary' : 'inherit'}
                            sx={{ minWidth: 0, p: 1, height: 40 }}
                          >
                            {epNumber}
                          </Button>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Torrent Table */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
                  Available Torrents
                </Typography>
                <TorrentTable
                  torrents={torrents}
                  title={
                    isTv
                      ? `${displayTitle} S${String(videoParams.season).padStart(2, '0')}E${String(videoParams.episode).padStart(2, '0')}`
                      : displayTitle
                  }
                  isLoading={torrentsLoading}
                  error={torrentsError}
                />
              </Box>

              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                {post?.overview}
              </Typography>

              <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                {post?.genres?.map((genre) => (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    size="small"
                    variant="soft"
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Sidebar */}
          <Grid xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>Top Cast</Typography>
            <Stack spacing={2}>
              {cast.map((actor) => (
                <Stack key={actor.id} direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    alt={actor.name}
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                    sx={{ width: 48, height: 48 }}
                  />
                  <Stack>
                    <Typography variant="subtitle2">{actor.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {actor.character}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Recommendations */}
      {!!latestPosts?.length && (
        <Container sx={{ py: 10 }}>
          <Typography variant="h4" sx={{ mb: 5 }}>You May Also Like</Typography>
          <Grid container spacing={3}>
            {latestPosts.slice(0, 4).map((latestPost) => (
              <Grid key={latestPost.id} xs={12} sm={6} md={4} lg={3}>
                <PostItem post={latestPost} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </>
  );
}
