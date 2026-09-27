/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure environment variables for deployment
  env: {
    NEXT_PUBLIC_TMDB_BASE_URL: process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    NEXT_PUBLIC_TMDB_TOKEN: process.env.NEXT_PUBLIC_TMDB_TOKEN,
    NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
    NEXT_PUBLIC_JACKETT_API_URL: process.env.NEXT_PUBLIC_JACKETT_API_URL || 'https://jackett.youplex.site',
    NEXT_PUBLIC_JACKETT_API_KEY: process.env.NEXT_PUBLIC_JACKETT_API_KEY,
  },

  // PWA configuration - auto configures from next-pwa
};

module.exports = nextConfig;
