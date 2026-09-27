import { MainLayout } from '@/layouts/main';

export const metadata = {
  title: 'Book & eBook Torrents - EPUB, PDF, Comics & Manga',
  description: 'Download verified eBooks in EPUB and PDF format, magazines, comics, and textbook torrents.',
};

export default function Layout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
