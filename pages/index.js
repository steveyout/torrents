import orderBy from 'lodash/orderBy';
import { m } from 'framer-motion';
import { useEffect, useCallback, useState } from 'react';
// next
import NextLink from 'next/link';
// @mui
import { styled } from '@mui/material/styles';
import { Grid, Button, Container, Stack, Box, Alert, AlertTitle } from '@mui/material';
// hooks
import useSettings from '../hooks/useSettings';
import useIsMountedRef from '../hooks/useIsMountedRef';
// utils
import axios from '@/utils/axios';
// routes
import { PATH_PAGE } from '@/routes/paths';
// layouts
import Layout from '@/layouts';
// components
import Page from '@/components/Page';
import Iconify from '@/components/Iconify';
import { SkeletonPostItem } from '@/components/skeleton';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';
// sections
import { VideoPostCard, VideoPostsSort, VideoPostsSearch } from '@/sections/movies';
import EmptyContent from '@/components/EmptyContent';
import InfiniteScroll from 'react-infinite-scroller';
import { varFade } from '@/components/animate';
// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(11),
  },
}));

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

Index.getLayout = function getLayout(page) {
  return <Layout variant="main">{page}</Layout>;
};

// ----------------------------------------------------------------------

export default function Index({ data }) {
  const { themeStretch } = useSettings();

  const isMountedRef = useIsMountedRef();

  const [movies, setMovies] = useState(data);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState(`/api/movies/trending?page=${2}`);
  let [page, setPage] = useState(1);


  const getMovies = useCallback(async () => {
    try {
      if (movies && !movies.length) {
        const response = await axios.get(`/api/movies/trending`);

        if (isMountedRef.current) {
          setMovies(response.data);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  }, [isMountedRef]);

  useEffect(() => {
    getMovies();
  }, [getMovies]);

  ///more
  const handleLoadMore = useCallback(async () => {
    try {
      if (!url || url === '') return;
      const response = await axios.get(url);

      if (isMountedRef.current) {
        setMovies((prev) => [...prev, ...response.data]);
        setPage(page++);
        setUrl(`/api/movies/trending?page=${page}`);
      }
    } catch (error) {
      console.error(error);
    }
  }, [url]);

  ////////////structured data
  const list=[]
  movies&&movies.map((movie,index)=>{
    list.push({
      "@type": "ListItem",
      "position": index,
      "item": {
        "@type": "Movie",
        "url": PATH_PAGE.movie(movie._id),
        "name": movie.title,
        "image": movie.images.poster,
        "dateCreated": movie.year,
      }
    })
  })
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": list
  };

  return (
    <Page title="Youplex torrents" structuredData={structuredData}>
      <RootStyle>
        <Container maxWidth={themeStretch ? false : 'lg'}>
          <HeaderBreadcrumbs
            heading="Movies"
            links={[{ name: 'Home', href: '/' }, { name: 'Movies',href: PATH_PAGE.movies },{ name: 'Trending' }]}
          />

          <Stack mb={5} direction="row" alignItems="center" justifyContent="space-between">
            <VideoPostsSearch />
          </Stack>

          <Stack
            sx={{
              width: '100%',
              position: 'relative',
              zIndex: 10,
            }}
            spacing={2}
            mb={5}
          >
            <m.div variants={varFade().inRight}>
              <Alert variant="filled" severity="info">
                <AlertTitle>Important</AlertTitle>
                Sharing is caring,Remember to spread the word and help others.Join our{' '}
                <a
                  href={'https://t.me/youplexannouncments'}
                  style={{ textDecoration: 'underline', color: 'blue' }}
                >
                  Telegram
                </a>{' '}
                channel for more updates
              </Alert>
            </m.div>
          </Stack>

          <InfiniteScroll
            pageStart={0}
            loadMore={handleLoadMore}
            hasMore={url != null}
            threshold={2500}
            loader={
              <Grid container spacing={3} mt={1}>
                {[...Array(8)].map((post, index) =>
                  post ? (
                    <Grid key={post.id} item xs={12} sm={6} md={3}>
                      <VideoPostCard video={post} index={index} />
                    </Grid>
                  ) : (
                    <SkeletonPostItem key={index} />
                  )
                )}
              </Grid>
            }
          >
            <Grid container spacing={3}>
              {loading ? (
                [...Array(12)].map((post, index) =>
                  post ? (
                    <Grid key={post.id} item xs={12} sm={6} md={3}>
                      <VideoPostCard video={post} index={index} />
                    </Grid>
                  ) : (
                    <SkeletonPostItem key={index} />
                  )
                )
              ) : !loading && movies.length === 0 ? (
                <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
                  <EmptyContent
                    title={'Empty'}
                    img={'/images/empty.jpg'}
                    description={'no more movies'}
                  />
                </Box>
              ) : (
                movies.map((post, index) => (
                  <Grid key={post.id} item xs={12} sm={6} md={3}>
                    <VideoPostCard video={post} index={index} />
                  </Grid>
                ))
              )}
            </Grid>
          </InfiniteScroll>
        </Container>
      </RootStyle>
    </Page>
  );
}

export async function getServerSideProps(context) {
  try {
    const response= await axios.get(`${process.env.API}/movies/1?sort=trending`);
    const {data}=response
    return {
      props: {
        data: data,
      }, // will be passed to the page component as props
    };
  } catch (error) {
    console.error('error loading data');
    return {
      props: {
        data: [],
      }, // will be passed to the page component as props
    };
  }
}
