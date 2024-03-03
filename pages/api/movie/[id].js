import axios from "@/utils/axios";


export default async function handler(req, res) {
  try {
    const id  = await req.query.imdb_id;
    const response= await axios.get(`${process.env.API}/movie/${id}`);
    const {data}=response
    const result= await axios.get(`${process.env.API}/movies/12?genre=${data.genres[0]}`);
    data.recommendations=result.data
    res.status(200).json(data);
  } catch (error) {
    console.error('failed to load data');
    res.status(500).json({ error: 'failed to load data' });
  }
}
