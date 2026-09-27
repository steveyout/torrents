import { paramCase } from '@/utils/change-case';

// ----------------------------------------------------------------------

export const paths = {
  home: '/',
  search: '/search',
  movies: '/movies',
  tv: '/tv',
  games: '/games',
  music: '/music',
  audio: '/audio',
  books: '/books',
  torrents: '/torrents',
  discord: 'https://discord.gg/5eWu9Vz6tQ',
  telegram: 'https://t.me/youplexannouncments',
  watch: {
    root: `/watch`,
    details: (type, id, title = 'video', sn = 1, ep = 1) => {
      const base = `/watch/${type}/${paramCase(title)}?id=${id}`;
      return type === 'tv' ? `${base}&season=${sn}&episode=${ep}` : base;
    },
  },
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
};
