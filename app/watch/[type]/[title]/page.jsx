import { redirect } from 'next/navigation';

export default async function WatchRedirect(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const type = params?.type || 'movie';
  const title = params?.title || 'torrent';
  const qs = new URLSearchParams(searchParams || {}).toString();

  redirect(`/torrent/${type}/${title}${qs ? `?${qs}` : ''}`);
}
