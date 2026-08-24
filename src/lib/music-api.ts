export interface Song {
  id: string;
  name: string;
  artists: { primary: { name: string }[] };
  image: { link: string; quality: string }[];
  downloadUrl: { link: string; quality: string }[];
  duration: number;
}

const API_BASE = 'https://jiosvvnn.vercel.app/api';

export async function searchSongs(query: string): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.data?.results || [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

export async function getTrending(): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=trending`);
    const data = await res.json();
    return data.data?.results || [];
  } catch (error) {
    console.error('Trending fetch failed:', error);
    return [];
  }
}

export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getBestImage(song: Song): string | null {
  if (!song.image || song.image.length === 0) return null;
  return song.image[song.image.length - 1]?.link || null;
}

export function getBestDownload(song: Song): string {
  if (!song.downloadUrl || song.downloadUrl.length === 0) return '';
  return song.downloadUrl[song.downloadUrl.length - 1]?.link || '';
}

export function getArtistNames(song: Song) {
  if (!song.artists?.primary) return 'Unknown Artist';
  return song.artists.primary.map(a => a.name).join(', ');
}
