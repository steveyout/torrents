import axios from "@/utils/axios";

export default async function handler(req, res) {
  try {
    const id  = await req.query.imdb_id;
    const response= await axios.get(`${process.env.API}/show/${id}`);
    const {data}=response
    const result= await axios.get(`${process.env.API}/shows/12?genre=${data.genres[0]}`);
    data.recommendations=result.data
    return {
      props: {
        data: data,
      }, // will be passed to the page component as props
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        data: null,
      }, // will be passed to the page component as props
    };
  }
}
