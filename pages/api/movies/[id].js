///axios
import axios from "@/utils/axios";

export default async function handler(req, res) {
  try {
    const response= await axios.get(`${process.env.API}/movies/15?sort=last added`);
    const {data}=response
    res.status(200).json(data);
  } catch (error) {
    console.error('failed to load data');
    res.status(500).json({ error: 'failed to load data' });
  }
}
