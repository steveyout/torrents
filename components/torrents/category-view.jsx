'use client';

import { useState, useEffect, useCallback } from 'react';
import { Iconify } from '@/components/iconify';
import { TorrentTable } from './torrent-table';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

export function CategoryView({
  category,
  title,
  subtitle,
  icon,
  quickFilters = [],
}) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [torrents, setTorrents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTorrents = useCallback(
    async (searchTerm) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          category,
          limit: '50',
        });
        if (searchTerm && searchTerm.trim()) {
          params.set('q', searchTerm.trim());
        }

        const res = await fetch(`/api/torrents?${params.toString()}`);
        if (!res.ok) throw new Error(`Failed to load ${category} torrents`);
        const data = await res.json();
        setTorrents(data.torrents || []);
      } catch (err) {
        setError(err.message || 'Unable to connect to torrent indexers');
      } finally {
        setIsLoading(false);
      }
    },
    [category]
  );

  useEffect(() => {
    const finalSearch = activeFilter ? `${query} ${activeFilter}`.trim() : query;
    fetchTorrents(finalSearch);
  }, [category, activeFilter, fetchTorrents]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const finalSearch = activeFilter ? `${query} ${activeFilter}`.trim() : query;
    fetchTorrents(finalSearch);
  };

  const handleFilterClick = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter('');
      fetchTorrents(query);
    } else {
      setActiveFilter(filter);
      fetchTorrents(query ? `${query} ${filter}` : filter);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      {/* Header */}
      <Stack spacing={1.5} sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon={icon} width={38} sx={{ color: 'primary.main' }} />
          <Typography variant="h3" fontWeight={800}>
            {title}
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 700 }}>
          {subtitle}
        </Typography>
      </Stack>

      {/* Quick Filters */}
      {quickFilters.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 0.5, scrollbarWidth: 'none' }}>
          {quickFilters.map((qf) => {
            const isSelected = activeFilter === qf;
            return (
              <Chip
                key={qf}
                label={qf}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                onClick={() => handleFilterClick(qf)}
                sx={{ fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', borderRadius: 1.5 }}
              />
            );
          })}
        </Stack>
      )}

      {/* Search Bar */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            placeholder={`Search ${title.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-bold" width={20} sx={{ color: 'text.disabled' }} />
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
              minWidth: { sm: 130 },
            }}
          >
            Search
          </Button>
        </Stack>
      </Box>

      {/* Results */}
      <TorrentTable
        torrents={torrents}
        title={query ? `Results for "${query}"` : `Top ${title}`}
        isLoading={isLoading}
        error={error}
      />
    </Container>
  );
}
