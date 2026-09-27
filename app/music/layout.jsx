import { MainLayout } from '@/layouts/main';

export const metadata = {
  title: 'Music Torrents - Lossless FLAC & MP3 Albums',
  description: 'Download high quality lossless FLAC and 320kbps MP3 music torrents, albums, and discographies.',
};

export default function Layout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
