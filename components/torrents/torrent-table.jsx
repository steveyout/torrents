'use client';

import { useState, useMemo, useEffect } from 'react';
import { fDate, fAge } from '@/utils/format-time';
import { fData } from '@/utils/format-number';
import { Iconify } from '@/components/iconify';
import { trackDownload } from '@/utils/gtag';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------

function descendingComparator(a, b, property) {
  if (property === 'rawSize' || property === 'seeders' || property === 'leechers') {
    const numA = Number(a[property]) || 0;
    const numB = Number(b[property]) || 0;
    return numB - numA;
  }

  if (property === 'pubDate') {
    const timeA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const timeB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return timeB - timeA;
  }

  if (property === 'indexer') {
    const strA = (a.indexer || a.tracker || '').toLowerCase();
    const strB = (b.indexer || b.tracker || '').toLowerCase();
    return strB.localeCompare(strA);
  }

  const strA = (a[property] || a.title || '').toString().toLowerCase();
  const strB = (b[property] || b.title || '').toString().toLowerCase();
  return strB.localeCompare(strA);
}

function getComparator(order, property) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, property)
    : (a, b) => -descendingComparator(a, b, property);
}

// ----------------------------------------------------------------------

export function TorrentTable({
  torrents = [],
  title = '',
  isLoading = false,
  error = null,
  defaultRowsPerPage = 10,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Sorting state (default: seeders desc)
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('seeders');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  // In-table quick filter
  const [filterQuery, setFilterQuery] = useState('');

  // Reset page when torrents dataset or filter changes
  useEffect(() => {
    setPage(0);
  }, [torrents, filterQuery]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtered and sorted data
  const filteredTorrents = useMemo(() => {
    if (!filterQuery.trim()) return torrents;
    const q = filterQuery.toLowerCase().trim();
    return torrents.filter((item) => {
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchIndexer = (item.indexer || item.tracker || '').toLowerCase().includes(q);
      const matchRes = (item.resolution || '').toLowerCase().includes(q);
      return matchTitle || matchIndexer || matchRes;
    });
  }, [torrents, filterQuery]);

  const sortedTorrents = useMemo(
    () => [...filteredTorrents].sort(getComparator(order, orderBy)),
    [filteredTorrents, order, orderBy]
  );

  const paginatedTorrents = useMemo(
    () => sortedTorrents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedTorrents, page, rowsPerPage]
  );

  // Helper to copy text to clipboard with fallback
  const copyToClipboard = async (text) => {
    if (!text) return false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(textArea);
      }
      return true;
    }
    return false;
  };

  // Resolve and copy magnet URI
  const handleCopyMagnet = async (torrent) => {
    const id = torrent.id || torrent.title;
    setLoadingActionId(id);

    try {
      if (torrent.magnetUrl) {
        await copyToClipboard(torrent.magnetUrl);
        trackDownload(torrent, 'magnet');
        setCopiedId(id);
        setFeedback({ severity: 'success', message: 'Magnet URI copied to clipboard!' });
        setTimeout(() => setCopiedId(null), 2500);
        return;
      }

      // If magnet not directly in item (e.g. TorrentGalaxy behind /dl/), resolve it
      const targetUrl = torrent.directUrl || torrent.downloadUrl;
      if (targetUrl) {
        const res = await fetch(
          `/api/torrents/download?format=json&url=${encodeURIComponent(targetUrl)}&title=${encodeURIComponent(torrent.title)}`,
          { headers: { Accept: 'application/json' } }
        );
        const data = await res.json();
        if (data.magnetUrl) {
          torrent.magnetUrl = data.magnetUrl;
          await copyToClipboard(data.magnetUrl);
          trackDownload(torrent, 'magnet');
          setCopiedId(id);
          setFeedback({ severity: 'success', message: 'Magnet URI resolved & copied to clipboard!' });
          setTimeout(() => setCopiedId(null), 2500);
          return;
        }
      }

      setFeedback({ severity: 'warning', message: 'No magnet URI available for this release.' });
    } catch {
      setFeedback({ severity: 'error', message: 'Could not resolve magnet link.' });
    } finally {
      setLoadingActionId(null);
    }
  };

  // Open magnet directly in the user's desktop torrent client
  const handleOpenClient = async (torrent) => {
    const id = torrent.id || torrent.title;
    setLoadingActionId(id);

    try {
      if (torrent.magnetUrl) {
        window.location.href = torrent.magnetUrl;
        trackDownload(torrent, 'client');
        setFeedback({ severity: 'info', message: 'Launching torrent client...' });
        return;
      }

      const targetUrl = torrent.directUrl || torrent.downloadUrl;
      if (targetUrl) {
        const res = await fetch(
          `/api/torrents/download?format=json&url=${encodeURIComponent(targetUrl)}&title=${encodeURIComponent(torrent.title)}`,
          { headers: { Accept: 'application/json' } }
        );
        const data = await res.json();
        if (data.magnetUrl) {
          torrent.magnetUrl = data.magnetUrl;
          window.location.href = data.magnetUrl;
          trackDownload(torrent, 'client');
          setFeedback({ severity: 'info', message: 'Launching torrent client...' });
          return;
        }
      }

      setFeedback({ severity: 'warning', message: 'Could not open client for this release.' });
    } catch {
      setFeedback({ severity: 'error', message: 'Failed to launch torrent client.' });
    } finally {
      setLoadingActionId(null);
    }
  };

  // Download the actual .torrent file directly to the browser
  const handleDownload = async (torrent) => {
    const id = torrent.id || torrent.title;
    setLoadingActionId(id);

    try {
      const targetUrl = torrent.directUrl || torrent.downloadUrl || torrent.magnetUrl || '';
      const infoHash = torrent.infoHash || '';

      const downloadApiUrl = `/api/torrents/download?url=${encodeURIComponent(targetUrl)}&title=${encodeURIComponent(torrent.title)}&hash=${encodeURIComponent(infoHash)}`;

      const res = await fetch(downloadApiUrl, {
        headers: {
          Accept: 'application/x-bittorrent, application/octet-stream, */*',
        },
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.error || `Download failed with status ${res.status}`);
      }

      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Received empty torrent file.');
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      const cleanName = (torrent.title || 'torrent').replace(/[\\/:*?"<>|]/g, '').trim() || 'download';
      a.download = `${cleanName}.torrent`;
      document.body.appendChild(a);
      a.click();
      trackDownload(torrent, 'file');
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      setFeedback({ severity: 'success', message: `Downloaded "${cleanName}.torrent" to browser!` });
    } catch (err) {
      console.error('Download error:', err);
      setFeedback({ severity: 'error', message: err.message || 'Failed to download .torrent file.' });
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <Card sx={{ width: '100%', overflow: 'hidden' }}>
      {feedback && (
        <Alert
          severity={feedback.severity}
          onClose={() => setFeedback(null)}
          sx={{ mb: 2, mx: 2, mt: 2 }}
        >
          {feedback.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table Toolbar */}
      {(title || torrents.length > 0) && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {title && (
              <Typography variant="subtitle1" fontWeight={700}>
                {title}
              </Typography>
            )}
            <Chip
              label={`${filteredTorrents.length} ${filteredTorrents.length === 1 ? 'release' : 'releases'}`}
              size="small"
              color="primary"
              variant="soft"
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
          </Stack>

          {torrents.length > 5 && (
            <TextField
              size="small"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter releases (e.g. 1080p, 4K, repack)..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={18} sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: filterQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setFilterQuery('')} edge="end">
                      <Iconify icon="solar:close-circle-bold" width={16} sx={{ color: 'text.disabled' }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{ width: { xs: 1, sm: 280 } }}
            />
          )}
        </Box>
      )}

      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow>
              {/* Title / Release */}
              <TableCell sortDirection={orderBy === 'title' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={() => handleRequestSort('title')}
                >
                  Title / Release
                </TableSortLabel>
              </TableCell>

              {/* Size */}
              <TableCell align="center" sortDirection={orderBy === 'rawSize' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'rawSize'}
                  direction={orderBy === 'rawSize' ? order : 'desc'}
                  onClick={() => handleRequestSort('rawSize')}
                >
                  Size
                </TableSortLabel>
              </TableCell>

              {/* Seeders */}
              <TableCell align="center" sortDirection={orderBy === 'seeders' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'seeders'}
                  direction={orderBy === 'seeders' ? order : 'desc'}
                  onClick={() => handleRequestSort('seeders')}
                >
                  Seeders
                </TableSortLabel>
              </TableCell>

              {/* Leechers */}
              <TableCell align="center" sortDirection={orderBy === 'leechers' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'leechers'}
                  direction={orderBy === 'leechers' ? order : 'desc'}
                  onClick={() => handleRequestSort('leechers')}
                >
                  Leechers
                </TableSortLabel>
              </TableCell>

              {/* Source / Indexer */}
              <TableCell align="center" sortDirection={orderBy === 'indexer' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'indexer'}
                  direction={orderBy === 'indexer' ? order : 'asc'}
                  onClick={() => handleRequestSort('indexer')}
                >
                  Source
                </TableSortLabel>
              </TableCell>

              {/* Age */}
              <TableCell align="center" sortDirection={orderBy === 'pubDate' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'pubDate'}
                  direction={orderBy === 'pubDate' ? order : 'desc'}
                  onClick={() => handleRequestSort('pubDate')}
                >
                  Age
                </TableSortLabel>
              </TableCell>

              {/* Actions */}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    Searching indexers across Jackett...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : torrents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Iconify icon="solar:sad-circle-bold" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                  <Typography variant="subtitle1" color="text.secondary">
                    No torrents found
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Try refining your search query or check Jackett indexer status.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredTorrents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Iconify icon="solar:magnifer-linear" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                  <Typography variant="subtitle1" color="text.secondary">
                    No releases matching &quot;{filterQuery}&quot;
                  </Typography>
                  <Button
                    size="small"
                    variant="soft"
                    sx={{ mt: 1.5 }}
                    onClick={() => setFilterQuery('')}
                  >
                    Clear Filter
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTorrents.map((torrent, idx) => {
                const isWorking = loadingActionId === (torrent.id || torrent.title);
                const isCopied = copiedId === (torrent.id || torrent.title);

                return (
                  <TableRow
                    key={torrent.id || idx}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell component="th" scope="row" sx={{ maxWidth: 380 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-all',
                        }}
                      >
                        {torrent.title}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {torrent.size || (torrent.rawSize ? fData(torrent.rawSize) : 'Unknown')}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={torrent.seeders || 0}
                        size="small"
                        color={torrent.seeders > 10 ? 'success' : torrent.seeders > 0 ? 'warning' : 'default'}
                        variant={torrent.seeders > 0 ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700, minWidth: 42 }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="caption" color="text.secondary">
                        {torrent.leechers || 0}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={torrent.indexer || torrent.tracker || 'Indexer'}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.72rem', textTransform: 'capitalize' }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip
                        title={torrent.pubDate ? (fDate(torrent.pubDate, 'DD MMM YYYY') || '') : ''}
                        arrow
                        placement="top"
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                          {fAge(torrent.pubDate)}
                        </Typography>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                        {/* Copy Magnet URI */}
                        <Tooltip title={isCopied ? 'Magnet Copied!' : 'Copy Magnet Link'}>
                          <IconButton
                            size="small"
                            color={isCopied ? 'success' : 'default'}
                            disabled={isWorking}
                            onClick={() => handleCopyMagnet(torrent)}
                          >
                            <Iconify
                              icon={isCopied ? 'solar:check-circle-bold' : 'solar:magnet-bold-duotone'}
                              width={20}
                            />
                          </IconButton>
                        </Tooltip>

                        {/* Open Direct in Client */}
                        <Tooltip title="Launch Client (Magnet)">
                          <IconButton
                            size="small"
                            color="info"
                            disabled={isWorking}
                            onClick={() => handleOpenClient(torrent)}
                          >
                            <Iconify icon="solar:plain-bold-duotone" width={20} />
                          </IconButton>
                        </Tooltip>

                        {/* Download .torrent file to browser */}
                        <Tooltip title="Download .torrent file to browser">
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            disabled={isWorking}
                            onClick={() => handleDownload(torrent)}
                            startIcon={
                              isWorking ? (
                                <CircularProgress size={14} color="inherit" />
                              ) : (
                                <Iconify icon="solar:download-square-bold" width={16} />
                              )
                            }
                            sx={{ textTransform: 'none', px: 1.5, py: 0.5, fontWeight: 600 }}
                          >
                            {isWorking ? 'Downloading...' : 'Download'}
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredTorrents.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredTorrents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
          }}
        />
      )}
    </Card>
  );
}
