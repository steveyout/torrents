const isStaticExport = 'false';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disable in dev to speed up workflow
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  trailingSlash: false,
  compress: true,
  poweredByHeader: false,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
    ],
  },
  env: {
    BUILD_STATIC_EXPORT: isStaticExport,
  },
  async redirects() {
    return [
      {
        source: '/watch/:type/:title',
        destination: '/torrent/:type/:title',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/torrents/:type/:title',
        destination: '/torrent/:type/:title',
      },
    ];
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  ...(isStaticExport === 'true' && {
    output: 'export',
  }),
};

export default withPWA(nextConfig);
