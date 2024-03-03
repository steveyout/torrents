import { getServerSideSitemap } from 'next-sitemap'
import axios from "@/utils/axios";
export const getServerSideProps = async (ctx) => {
  const response= await axios.get(`${process.env.API}/movies/12?sort=trending&order=-1`);
  const {data}=response


    data.map((movie, index) =>{
    const{_id,title}=movie
    fields.push({
      loc:  `${process.env.SITE_URL}/movie/${title}?imdb_id=${_id}`, // Absolute url
      lastmod: new Date().toISOString(),
      priority:1
    },)
  })

  return getServerSideSitemap(ctx, fields)
}

// Default export to prevent next.js errors
export default function Sitemap() {}