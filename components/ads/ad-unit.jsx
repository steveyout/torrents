'use client';

import { memo, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

// Ad configurations provided by user
export const AD_CONFIGS = {
  // 160x600 Wide Skyscraper
  skyscraper: {
    key: 'db286534355560bb44457576fd0665fb',
    width: 160,
    height: 600,
    format: 'iframe',
    scriptSrc: 'https://bancadeltempoidea.org/22/db286534355560bb44457576fd0665fb',
    label: '160x600 Skyscraper',
  },
  // 160x300 Half Skyscraper
  halfSkyscraper: {
    key: 'b0232c322b8c1c39292429c2667a837d',
    width: 160,
    height: 300,
    format: 'iframe',
    scriptSrc: 'https://bancadeltempoidea.org/22/b0232c322b8c1c39292429c2667a837d',
    label: '160x300 Half Skyscraper',
  },
};

export const AdUnit = memo(function AdUnit({
  variant = 'skyscraper', // 'skyscraper' | 'halfSkyscraper'
  showLabel = true,
  sx = {},
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = AD_CONFIGS[variant] || AD_CONFIGS.skyscraper;
  const { key, width, height, format, scriptSrc } = config;

  // Self-contained HTML for the isolated ad iframe.
  // This isolates document.write() and window.atOptions so they cannot conflict with Next.js or React hydration.
  const adHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <base target="_blank" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${key}',
      'format' : '${format}',
      'height' : ${height},
      'width' : ${width},
      'params' : {}
    };
  <\/script>
  <script type="text/javascript" src="${scriptSrc}"><\/script>
</body>
</html>`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        my: 2,
        ...sx,
      }}
    >
      {showLabel && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.disabled',
            mb: 0.5,
            userSelect: 'none',
          }}
        >
          Advertisement
        </Typography>
      )}

      <Box
        sx={{
          width: `${width}px`,
          height: `${height}px`,
          minWidth: `${width}px`,
          minHeight: `${height}px`,
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: (theme) => alpha(theme.palette.background.neutral || '#888', 0.25),
          border: (theme) => `1px dashed ${alpha(theme.palette.divider, 0.4)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {mounted && (
          <iframe
            title={`ad-${key}`}
            srcDoc={adHtml}
            width={width}
            height={height}
            scrolling="no"
            style={{
              border: 0,
              width: `${width}px`,
              height: `${height}px`,
              overflow: 'hidden',
              display: 'block',
            }}
          />
        )}
      </Box>
    </Box>
  );
});
