import { paths } from '@/routes/paths';
import { Iconify } from '@/components/iconify';

// ----------------------------------------------------------------------

export const navData = [
  {
    title: 'Home',
    path: '/',
    icon: <Iconify width={20} icon="solar:home-2-bold-duotone" />,
  },
  {
    title: 'Search',
    path: paths.search,
    icon: <Iconify width={20} icon="solar:magnifer-bold-duotone" />,
  },
  {
    title: 'Movies',
    path: paths.movies,
    icon: <Iconify width={20} icon="solar:clapperboard-bold-duotone" />,
  },
  {
    title: 'TV Shows',
    path: paths.tv,
    icon: <Iconify width={20} icon="solar:tv-bold-duotone" />,
  },
  {
    title: 'Categories',
    path: paths.torrents,
    icon: <Iconify width={20} icon="solar:widget-2-bold-duotone" />,
    children: [
      {
        subheader: 'Software & Media',
        items: [
          { title: 'PC Games & Repacks', path: paths.games },
          { title: 'Lossless Music (FLAC / MP3)', path: paths.music },
        ],
      },
      {
        subheader: 'Audio & Literature',
        items: [
          { title: 'Audiobooks & Spoken', path: paths.audio },
          { title: 'Books, eBooks & Manga', path: paths.books },
        ],
      },
      {
        subheader: 'Torrents Hub',
        items: [
          { title: 'Browse All Torrents', path: paths.torrents },
          { title: 'Universal Torrent Search', path: paths.search },
        ],
      },
    ],
  },
  {
    title: 'Discord',
    icon: <Iconify width={20} icon="ic:round-discord" />,
    path: paths.discord,
  },
];
