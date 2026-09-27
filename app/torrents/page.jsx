'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Iconify } from '@/components/iconify';
import { TorrentTable } from '@/components/torrents';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

const CATEGORIES = [
  { id: 'all', label: 'All Torrents', icon: 'solar:widget-2-bold' },
  { id: 'movies', label: 'Movies', icon: 'solar:clapperboard-play-bold' },
  { id: 'tv', label: 'TV Shows', icon: 'solar:tv-bold' },
  { id: 'games', label: 'Games', icon: 'solar:gamepad-bold' },
  { id: 'music', label: 'Music', icon: 'solar:music-note-bold' },
  { id: 'audio', label: 'Audio', icon: 'solar:headphones-round-sound-bold' },
  { id: 'books', label: 'Books', icon: 'solar:book-bookmark-bold' },
];

export default function TorrentsPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCat = searchParams.get('cat') || searchParams.get('category') || 'all';

  const [category, setCategory] = useState(initialCat);
  const [query, setQuery] = useState(initialQ);
  const [torrents, setTorrents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTorrents = useCallback(async (cat, q) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (cat && cat !== 'all') params.set('category', cat);
      if (q && q.trim()) params.set('q', q.trim());
      params.set('limit', '50');

      const res = await fetch(`/api/torrents?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to retrieve torrents');
      const data = await res.json();
      setTorrents(data.torrents || []);
    } catch (err) {
      setError(err.message || 'Error fetching torrents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTorrents(category, query);
  }, [category, fetchTorrents]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchTorrents(category, query);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      {/* Header */}
      <Stack spacing={1.5} sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="solar:download-square-bold-duotone" width={36} sx={{ color: 'primary.main' }} />
          <Typography variant="h3" fontWeight={800}>
            Torrent Explorer
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 700 }}>
          Search millions of verified torrents across healthy indexers. Filter by category, inspect seeders, copy magnet links instantly.
        </Typography>
      </Stack>

      {/* Category Selection Chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 1, scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat.id;
          return (
            <Chip
              key={cat.id}
              icon={<Iconify icon={cat.icon} width={18} />}
              label={cat.label}
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => {
                setCategory(cat.id);
                fetchTorrents(cat.id, query);
              }}
              sx={{
                fontWeight: 700,
                fontSize: '0.85rem',
                py: 2,
                px: 0.5,
                borderRadius: 2,
                cursor: 'pointer',
              }}
            />
          );
        })}
      </Stack>

      {/* Search Bar */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            placeholder={`Search ${category === 'all' ? 'torrents' : category}... (e.g. title, 1080p, 4k)`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-bold" width={22} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'background.paper',
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            startIcon={<Iconify icon="solar:magnifer-bold" width={20} />}
            sx={{
              px: 4,
              borderRadius: 2,
              fontWeight: 700,
              minWidth: { sm: 140 },
            }}
          >
            Search
          </Button>
        </Stack>
      </Box>

      {/* Results Table */}
      <TorrentTable
        torrents={torrents}
        title={
          query
            ? `Results for "${query}" in ${category.toUpperCase()}`
            : `Popular in ${category.toUpperCase()}`
        }
        isLoading={isLoading}
        error={error}
      />
    </Container>
  );
}
