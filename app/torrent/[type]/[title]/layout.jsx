import { CONFIG } from '@/config-global';
import { getMovieOrShow, searchMedia } from '@/actions/api';

// ----------------------------------------------------------------------

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const type = resolvedParams?.type || 'movie';
  const titleSlug = resolvedParams?.title || '';
  const id = resolvedSearchParams?.id;

  const baseUrl = CONFIG.site.serverUrl || 'https://youplex.cc';
  const cleanTitle = decodeURIComponent(titleSlug).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  let media = null;
  try {
    if (id) {
      media = await getMovieOrShow(type, id);
    } else if (cleanTitle) {
      const searchRes = await searchMedia(cleanTitle);
      media = searchRes?.results?.[0] || null;
    }
  } catch {
    media = null;
  }

  const displayTitle = media?.title || media?.name || cleanTitle;
  const releaseDate = media?.release_date || media?.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const yearLabel = year ? ` (${year})` : '';
  const mediaTypeLabel = type === 'tv' ? 'TV Series' : 'Movie';

  const metaTitle = `${displayTitle}${yearLabel} Torrents & Magnet Links - 4K, 1080p, 720p | Youplex`;
  const metaDescription = `Download verified ${displayTitle}${yearLabel} ${mediaTypeLabel} torrents and magnet links. Verified high-speed seeders, 4K UHD, 1080p, 720p, high quality audio, and multiple releases across major indexers on Youplex.`;

  const canonicalUrl = `${baseUrl}/torrent/${type}/${titleSlug}`;
  const posterUrl = media?.poster_path
    ? `https://image.tmdb.org/t/p/w780${media.poster_path}`
    : `${baseUrl}/assets/logo/logo-single.svg`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'Youplex',
      images: [
        {
          url: posterUrl,
          width: 780,
          height: 1170,
          alt: `${displayTitle} Poster`,
        },
      ],
      type: type === 'tv' ? 'video.tv_show' : 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [posterUrl],
    },
  };
}

export default async function TorrentDetailLayout({ children, params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const type = resolvedParams?.type || 'movie';
  const titleSlug = resolvedParams?.title || '';
  const id = resolvedSearchParams?.id;
  const baseUrl = CONFIG.site.serverUrl || 'https://youplex.cc';

  let media = null;
  const cleanTitle = decodeURIComponent(titleSlug).replace(/-/g, ' ');
  try {
    if (id) {
      media = await getMovieOrShow(type, id);
    } else if (cleanTitle) {
      const searchRes = await searchMedia(cleanTitle);
      media = searchRes?.results?.[0] || null;
    }
  } catch {
    media = null;
  }

  const displayTitle = media?.title || media?.name || cleanTitle;
  const releaseDate = media?.release_date || media?.first_air_date;
  const canonicalUrl = `${baseUrl}/torrent/${type}/${titleSlug}`;
  const posterUrl = media?.poster_path
    ? `https://image.tmdb.org/t/p/w780${media.poster_path}`
    : `${baseUrl}/assets/logo/logo-single.svg`;

  // JSON-LD Structured Data Schema for Rich Snippets
  const schemaType = type === 'tv' ? 'TVSeries' : 'Movie';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: displayTitle,
    description: media?.overview || `Verified torrents and magnet links for ${displayTitle}.`,
    image: posterUrl,
    datePublished: releaseDate,
    ...(media?.vote_average && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: media.vote_average.toFixed(1),
        bestRating: '10',
        ratingCount: media.vote_count || 100,
      },
    }),
    ...(media?.genres && {
      genre: media.genres.map((g) => g.name),
    }),
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: type === 'tv' ? 'TV Shows' : 'Movies',
        item: `${baseUrl}/${type === 'tv' ? 'tv' : 'movies'}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: displayTitle,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {children}
    </>
  );
}
