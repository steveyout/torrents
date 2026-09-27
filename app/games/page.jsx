import { CategoryView } from '@/components/torrents';

export default function GamesPage() {
  return (
    <CategoryView
      category="games"
      title="Game Torrents"
      subtitle="Discover and download the latest PC games, repacks, and updates from top healthy trackers."
      icon="solar:gamepad-bold-duotone"
      quickFilters={['PC', 'Repack', 'Action', 'RPG', 'Steam', 'FitGirl', 'DODI']}
    />
  );
}
