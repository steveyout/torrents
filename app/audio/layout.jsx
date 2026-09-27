import { MainLayout } from '@/layouts/main';

export const metadata = {
  title: 'Audiobook & Audio Torrents - Unabridged Audiobooks',
  description: 'Download unabridged audiobooks, podcasts, radio shows, and sound libraries.',
};

export default function Layout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
