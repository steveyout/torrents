import { CategoryView } from '@/components/torrents';

export default function AudioPage() {
  return (
    <CategoryView
      category="audio"
      title="Audio & Audiobook Torrents"
      subtitle="Listen to popular bestselling audiobooks, spoken word, dramatizations, and podcasts."
      icon="solar:headphones-round-sound-bold-duotone"
      quickFilters={['Audiobook', 'M4B', 'MP3', 'Fantasy', 'Sci-Fi', 'Thriller', 'Biography']}
    />
  );
}
