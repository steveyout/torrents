'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Iconify } from '@/components/iconify';
import { PostItem } from '@/sections/movies/post-item';
import { TorrentTable } from '@/components/torrents';
import { searchMedia } from '@/actions/api';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

const SEARCH_TABS = [
  { id: 'all', label: 'All Results', icon: 'solar:widget-2-bold' },
  { id: 'movies', label: 'Movies & TV', icon: 'solar:clapperboard-play-bold' },
  { id: 'games', label: 'Games', icon: 'solar:gamepad-bold' },
  { id: 'music', label: 'Music', icon: 'solar:music-note-bold' },
  { id: 'audio', label: 'Audio', icon: 'solar:headphones-round-sound-bold' },
  { id: 'books', label: 'Books', icon: 'solar:book-bookmark-bold' },
];

export default function SearchPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || searchParams.get('query') || '';
  const urlCategory = searchParams.get('cat') || searchParams.get('category') || 'all';

  const [query, setQuery] = useState(urlQuery);
  const [activeTab, setActiveTab] = useState(urlCategory);

  // TMDB Media results
  const [mediaResults, setMediaResults] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Jackett Torrent results
  const [torrentResults, setTorrentResults] = useState([]);
  const [torrentsLoading, setTorrentsLoading] = useState(false);
  const [torrentsError, setTorrentsError] = useState(null);

  const performSearch = useCallback(async (searchTerm, category) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setMediaResults([]);
      setTorrentResults([]);
      return;
    }

    const trimmed = searchTerm.trim();

    // 1. Search TMDB if relevant
    if (category === 'all' || category === 'movies') {
      setMediaLoading(true);
      searchMedia(trimmed)
        .then((data) => setMediaResults(data?.results || []))
        .catch(() => setMediaResults([]))
        .finally(() => setMediaLoading(false));
    } else {
      setMediaResults([]);
    }

    // 2. Search Jackett Torrents API
    setTorrentsLoading(true);
    setTorrentsError(null);
    try {
      const params = new URLSearchParams({
        q: trimmed,
        category: category === 'all' ? 'all' : category,
        limit: '60',
      });
      const res = await fetch(`/api/torrents?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTorrentResults(data.torrents || []);
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      setTorrentsError(err.message || 'Error querying torrent indexers');
    } finally {
      setTorrentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (urlQuery) {
      performSearch(urlQuery, activeTab);
    }
  }, [urlQuery, activeTab, performSearch]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    performSearch(query, activeTab);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (query) {
      performSearch(query, tabId);
    }
  };

  const filteredMedia = mediaResults.filter(
    (item) => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv' || item.title || item.name)
  );

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      {/* Search Header */}
      <Stack spacing={2} sx={{ mb: 4, textAlign: 'center', maxWidth: 720, mx: 'auto' }}>
        <Typography variant="h3" fontWeight={800}>
          Search Torrents
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Find movies, TV series, PC games, lossless music, audiobooks, and eBooks across tested healthy trackers.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              fullWidth
              autoFocus
              placeholder="Search by title, quality, artist, or author..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-bold" width={22} sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: 'background.paper',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={torrentsLoading || mediaLoading}
              sx={{ px: 4, borderRadius: 2.5, fontWeight: 700, minWidth: 120 }}
            >
              Search
            </Button>
          </Stack>
        </Box>
      </Stack>

      {/* Tabs */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 4, overflowX: 'auto', pb: 1, scrollbarWidth: 'none' }}
      >
        {SEARCH_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <Chip
              key={tab.id}
              icon={<Iconify icon={tab.icon} width={18} />}
              label={tab.label}
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => handleTabChange(tab.id)}
              sx={{
                fontWeight: 700,
                fontSize: '0.85rem',
                py: 2,
                px: 1,
                borderRadius: 2,
                cursor: 'pointer',
              }}
            />
          );
        })}
      </Stack>

      {/* TMDB Media Card Results (for Movies & TV) */}
      {filteredMedia.length > 0 && (activeTab === 'all' || activeTab === 'movies') && (
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
            <Iconify icon="solar:clapperboard-play-bold" width={24} sx={{ color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={700}>
              Matched Movies & TV Shows
            </Typography>
            <Chip label={`${filteredMedia.length}`} size="small" color="primary" variant="soft" />
          </Stack>

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
            {filteredMedia.slice(0, 12).map((media, index) => (
              <PostItem key={media.id} post={media} index={index} />
            ))}
          </Box>
        </Box>
      )}

      {/* Direct Jackett Torrent Table Results */}
      <Box sx={{ mt: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Iconify icon="solar:magnet-bold" width={24} sx={{ color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>
            Torrent Releases
          </Typography>
        </Stack>

        <TorrentTable
          torrents={torrentResults}
          title={query ? `Torrents for "${query}"` : 'Torrent Search Results'}
          isLoading={torrentsLoading}
          error={torrentsError}
        />
      </Box>
    </Container>
  );
}
