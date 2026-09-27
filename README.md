# Torrents App (Formerly Youplex)

A Next.js PWA application for streaming movies, TV shows and downloading torrents via Jackett API.

## Features

- **TMDB Integration**: Latest movies/shows from The Movie Database API
- **Jackett Torrent Searches**: Fetch torrents from 2 healthy indexers per query for speed
- **Category Filtering**: Movies, TV Shows, Games, Music sections with filters
- **Responsive Torrent Table**: Clean display of magnet links, seeders, size, health status
- **PWA Support**: Installable app on mobile devices

## Setup Instructions

```bash
# 1. Clone the repository
cd torrents

# 2. Install dependencies
yarn install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your:
# - TMDB_API_KEY (free from https://www.themoviedb.org/)
# - Jackett_API_URL (your Jackett instance)
# - Jackett_API_KEY

# 4. Start development server
yarn dev
```

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_TOKEN=your_tmdb_read_token_here
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_JACKETT_API_URL=https://jackett.youplex.site
NEXT_PUBLIC_JACKETT_API_KEY=your_jwt_token
APP_NAME=TorrentsApp
```

## Running

Development: `yarn dev`
Build & Start: `yarn build && yarn start`

## Project Structure

```
app/
  (index)/      # Homepage with TMDB latest content
  downloads/    # Torrent download page
  games/        # Games section (coming soon)
  music/        # Music albums (coming soon)
  search/       # Search page with filtering
  torrents/     # Dedicated torrent search view
  watch/
    [type]/[title]/  # Media detail pages
    torrent/      # Torrent details per title

api/
  scrape/        # Stream scraping
  subtitles/      # Subtitle scraping
  torrents/      # Jackett torrent API

actions/
  api.ts         # TMDB actions
  jackett-api.ts # Jackett torrent search actions

components/
  torrents/
    torrent-table.jsx  # Responsive torrent display

sections/
  featured/
    home-view.tsx     # Homepage with categories
```

## Torrent Table Features

- Shows magnet links
- Seeder counts (filter: healthy, seeding, low)
- File size in human-readable format
- Health status indicators
- Copy to clipboard functionality
- Responsive table layout

## API Filtering

The app automatically filters through Jackett indexes and only fetches from:
- Type = "scrape" 
- Status != "slow" or "dead"
- Only 2 best scrapers per query for speed

## License

MIT - You're free to use this for your own torrent streaming projects.
