import { MainLayout } from '@/layouts/main';

export const metadata = {
  title: 'Game Torrents - Download PC & Console Games',
  description: 'Download verified PC, Console, and Repack game torrents with fast speeds and high seed counts.',
};

export default function Layout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
