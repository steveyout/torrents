'use client';

import { m } from 'framer-motion';
import { paths } from '@/routes/paths';
import { varAlpha } from '@/theme/styles';
import { searchMedia } from '@/actions/api';
import { Iconify } from '@/components/iconify';
import { TorrentTable } from '@/components/torrents';
import { trackSearch } from '@/utils/gtag';
import { useDebounce } from '@/hooks/use-debounce';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { PostList } from '../post-list';
import { PostSort } from '../post-sort';
import { HeroBanner } from './hero-banner';
import { PostSearch } from '../post-search';

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'topRated', label: 'Top Rated' },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Content', icon: 'solar:widget-2-bold' },
  { id: 'movies', label: 'Movies', icon: 'solar:clapperboard-play-bold' },
  { id: 'tv', label: 'TV Shows', icon: 'solar:tv-bold' },
  { id: 'games', label: 'Games', icon: 'solar:gamepad-bold' },
  { id: 'music', label: 'Music', icon: 'solar:music-note-bold' },
  { id: 'audio', label: 'Audio', icon: 'solar:headphones-round-sound-bold' },
  { id: 'books', label: 'Books', icon: 'solar:book-bookmark-bold' },
];

export function PostListHomeView({ categories }) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [categoryTorrents, setCategoryTorrents] = useState({});
  const [torrentsLoading, setTorrentsLoading] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');

  const debouncedQuery = useDebounce(searchQuery);

  const isTorrentsOnlyCategory = ['games', 'music', 'audio', 'books'].includes(activeTab);

  const fetchCategoryTorrents = useCallback(async (cat, query = '') => {
    setTorrentsLoading(true);
    try {
      const params = new URLSearchParams({ category: cat });
      if (query.trim()) {
        params.set('q', query.trim());
        trackSearch(query.trim(), cat);
      }
      const res = await fetch(`/api/torrents?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCategoryTorrents((prev) => ({ ...prev, [cat]: data.torrents || [] }));
      }
    } catch (err) {
      console.error(`Failed to fetch ${cat} torrents:`, err);
    } finally {
      setTorrentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isTorrentsOnlyCategory) {
      if (!categoryTorrents[activeTab]) {
        fetchCategoryTorrents(activeTab, '');
      }
    }
  }, [activeTab, isTorrentsOnlyCategory, categoryTorrents, fetchCategoryTorrents]);

  const handleSearch = useCallback(async (inputValue) => {
    setSearchQuery(inputValue);
    if (inputValue.length > 2) {
      trackSearch(inputValue, 'movies/shows');
      setSearchLoading(true);
      try {
        const data = await searchMedia(inputValue);
        setSearchResults(data?.results || []);
      } catch (error) {
        console.error(error);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  }, []);

  const handleSortBy = useCallback((newValue) => {
    setSortBy(newValue);
  }, []);

  const formatSectionTitle = (key) => {
    switch (key) {
      case 'trending':
        return 'Trending Movies & Shows';
      case 'popularMovies':
        return 'Popular Movies';
      case 'topRatedTv':
        return 'Top Rated TV Shows';
      case 'upcoming':
        return 'Upcoming Releases';
      default: {
        const result = key.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
      }
    }
  };

  const getSectionIcon = (key) => {
    switch (key) {
      case 'trending':
        return 'solar:fire-bold';
      case 'popularMovies':
        return 'solar:flame-bold';
      case 'topRatedTv':
        return 'solar:star-bold';
      case 'upcoming':
        return 'solar:calendar-date-bold';
      default:
        return 'solar:play-circle-bold';
    }
  };

  const filteredCategories = useMemo(() => {
    if (activeTab === 'all') return categories;

    const res = {};
    if (activeTab === 'movies') {
      if (categories.popularMovies) res.popularMovies = categories.popularMovies;
      if (categories.upcoming) res.upcoming = categories.upcoming;
      if (categories.trending) {
        res.trending = categories.trending.filter((i) => (i.media_type || 'movie') === 'movie');
      }
    } else if (activeTab === 'tv') {
      if (categories.topRatedTv) res.topRatedTv = categories.topRatedTv;
      if (categories.trending) {
        res.trending = categories.trending.filter((i) => i.media_type === 'tv');
      }
    }
    return res;
  }, [categories, activeTab]);

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 1440,
          height: 600,
          background: (t) =>
            `radial-gradient(ellipse at 50% 0%, ${varAlpha(t.vars.palette.primary.mainChannel, 0.15)} 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <HeroBanner items={categories?.trending?.slice(0, 5)} />

      <Container sx={{ pb: 12, position: 'relative', zIndex: 1 }}>
        {/* Tier 1: Category Navigation Tabs */}
        <Box
          sx={{
            pt: { xs: 3, md: 4 },
            pb: 2,
            display: 'flex',
            justifyContent: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Box
            sx={{
              p: 0.75,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              maxWidth: '100%',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              borderRadius: 3,
              bgcolor: (t) => varAlpha(t.vars.palette.background.paperChannel, 0.55),
              border: (t) => `1px solid ${varAlpha(t.vars.palette.grey['500Channel'], 0.12)}`,
              backdropFilter: 'blur(16px)',
              boxShadow: (t) => `0 4px 24px -4px ${varAlpha(t.vars.palette.common.blackChannel, 0.18)}`,
            }}
          >
            {CATEGORY_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Box
                  key={tab.id}
                  component="button"
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCatSearchQuery('');
                  }}
                  sx={{
                    all: 'unset',
                    boxSizing: 'border-box',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: { xs: 1.75, sm: 2.25 },
                    py: 1,
                    borderRadius: 2.25,
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    color: active ? 'common.white' : 'text.secondary',
                    bgcolor: active ? 'primary.main' : 'transparent',
                    boxShadow: active
                      ? (t) => `0 4px 16px ${varAlpha(t.vars.palette.primary.mainChannel, 0.42)}`
                      : 'none',
                    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      color: active ? 'common.white' : 'text.primary',
                      bgcolor: active ? 'primary.main' : 'action.hover',
                    },
                  }}
                >
                  <Iconify icon={tab.icon} width={18} />
                  {tab.label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Tier 2: Dedicated Search & Filter Controls */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          sx={{ mb: 4, mt: 1.5 }}
        >
          {/* Active Section Context */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Iconify
              icon={
                activeTab === 'all'
                  ? 'solar:widget-2-bold'
                  : activeTab === 'movies'
                  ? 'solar:clapperboard-play-bold'
                  : activeTab === 'tv'
                  ? 'solar:tv-bold'
                  : activeTab === 'games'
                  ? 'solar:gamepad-bold'
                  : activeTab === 'music'
                  ? 'solar:music-note-bold'
                  : activeTab === 'audio'
                  ? 'solar:headphones-round-sound-bold'
                  : 'solar:book-bookmark-bold'
              }
              width={24}
              sx={{ color: 'primary.main' }}
            />
            <Typography variant="h5" fontWeight={700}>
              {activeTab === 'all'
                ? 'Featured & Highlights'
                : activeTab === 'movies'
                ? 'Movies Collection'
                : activeTab === 'tv'
                ? 'TV Series Collection'
                : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Torrents`}
            </Typography>
          </Stack>

          {/* Spacious Search and Controls */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ width: { xs: 1, md: 'auto' } }}
          >
            {!isTorrentsOnlyCategory ? (
              <>
                <PostSearch
                  query={debouncedQuery}
                  results={searchResults}
                  onSearch={handleSearch}
                  loading={searchLoading}
                  sx={{ width: { xs: 1, sm: 320, md: 380 } }}
                  hrefItem={(item) => {
                    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                    const title = item.title || item.name;
                    return paths.watch.details(type, item.id, title);
                  }}
                />
                <PostSort sort={sortBy} onSort={handleSortBy} sortOptions={SORT_OPTIONS} />
              </>
            ) : (
              <Stack
                direction="row"
                spacing={1}
                sx={{ width: { xs: 1, md: 'auto' }, flexGrow: { xs: 1, md: 0 } }}
              >
                <TextField
                  size="small"
                  placeholder={`Search ${activeTab} torrents...`}
                  value={catSearchQuery}
                  onChange={(e) => setCatSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchCategoryTorrents(activeTab, catSearchQuery);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:magnifer-bold" width={18} sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                    endAdornment: catSearchQuery ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setCatSearchQuery('');
                            fetchCategoryTorrents(activeTab, '');
                          }}
                          edge="end"
                        >
                          <Iconify icon="solar:close-circle-bold" width={16} sx={{ color: 'text.disabled' }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{ width: { xs: 1, sm: 280, md: 340 } }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => fetchCategoryTorrents(activeTab, catSearchQuery)}
                  sx={{ minWidth: 84, px: 2 }}
                >
                  Search
                </Button>
                <Button
                  size="small"
                  variant="soft"
                  color="inherit"
                  startIcon={<Iconify icon="solar:refresh-bold" width={16} />}
                  onClick={() => fetchCategoryTorrents(activeTab, catSearchQuery)}
                  disabled={torrentsLoading}
                >
                  Refresh
                </Button>
              </Stack>
            )}
          </Stack>
        </Stack>

        {isTorrentsOnlyCategory ? (
          <Box sx={{ mt: 1 }}>
            <TorrentTable
              torrents={categoryTorrents[activeTab] || []}
              title={`Top ${activeTab.toUpperCase()} Releases`}
              isLoading={torrentsLoading}
            />
          </Box>
        ) : (
          <Stack spacing={8}>
            {Object.keys(filteredCategories).map((key, sectionIdx) => {
              let items = filteredCategories[key];
              if (!items || items.length === 0) return null;

              if (key === 'trending' && items.length > 5 && activeTab === 'all') {
                items = items.slice(5);
              }

              const filteredItems = applyFilter(items, sortBy);

              return (
                <Box key={key}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <Iconify icon={getSectionIcon(key)} width={24} sx={{ color: 'primary.main' }} />
                    <Typography variant="h4" fontWeight={700}>
                      {formatSectionTitle(key)}
                    </Typography>
                    <Chip
                      label={filteredItems.length}
                      size="small"
                      color="primary"
                      variant="soft"
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  </Stack>

                  <PostList
                    posts={filteredItems}
                    loading={false}
                    categoryKey={key}
                    activeTab={activeTab}
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

function applyFilter(items, sortBy) {
  if (!items) return [];

  const cloned = [...items];

  if (sortBy === 'latest') {
    return cloned.sort((a, b) => {
      const dateA = new Date(a.release_date || a.first_air_date || 0);
      const dateB = new Date(b.release_date || b.first_air_date || 0);
      return dateB - dateA;
    });
  }

  if (sortBy === 'popular') {
    return cloned.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  if (sortBy === 'topRated') {
    return cloned.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  }

  return cloned;
}
