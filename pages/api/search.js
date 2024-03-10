import axios from '@/utils/axios';
export default async function handler(req, res) {
  try {
    const { id} = await req.query;
    const page=await req.query.page||1;
    const response= await axios.get(`${process.env.API}/movies/${page}?keywords=${id}`);
    const response2= await axios.get(`${process.env.API}/shows/${page}?keywords=${id}`);
    const response3= await axios.get(`${process.env.API}/animes/${page}?keywords=${id}`);
    const data=[...response.data,...response2.data,...response3.data]
    res.status(200).json(data);
  } catch (error) {
    console.error('failed to load data'+error);
    res.status(500).json({ error: 'failed to load data' });
  }
}
