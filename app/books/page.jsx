import { CategoryView } from '@/components/torrents';

export default function BooksPage() {
  return (
    <CategoryView
      category="books"
      title="Book & eBook Torrents"
      subtitle="Discover popular fiction, non-fiction, academic textbooks, manga, and comics in EPUB/PDF."
      icon="solar:book-bookmark-bold-duotone"
      quickFilters={['EPUB', 'PDF', 'Fiction', 'Fantasy', 'Sci-Fi', 'Comics', 'Manga', 'Textbooks']}
    />
  );
}
