import { CategoryView } from '@/components/torrents';

export default function MusicPage() {
  return (
    <CategoryView
      category="music"
      title="Music Torrents"
      subtitle="Explore top lossless FLAC albums, MP3 releases, vinyl rips, and full discographies."
      icon="solar:music-note-bold-duotone"
      quickFilters={['FLAC', 'MP3 320', 'Discography', 'Vinyl', 'Rock', 'Pop', 'Hip Hop', 'Electronic']}
    />
  );
}
