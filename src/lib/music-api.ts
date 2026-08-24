export interface Song {
  id: string;
  name: string;
  artists: { primary: { name: string }[] };
  image: { link: string; url?: string; quality: string }[];
  downloadUrl: { link: string; url?: string; quality: string }[];
  duration: number;
}

const API_BASE = 'https://jiosvvnn.vercel.app/api';

export async function searchSongs(query: string, page: number = 1): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    // The API usually returns results in data.data.results
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

export async function getTrending(page: number = 1): Promise<Song[]> {
  try {
    // Attempt to get trending songs, fallback to a popular search if query 'trending' fails
    const res = await fetch(`${API_BASE}/search/songs?query=Top%20Hits&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('Trending fetch failed:', error);
    return [];
  }
}

export function formatDuration(seconds: number) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getBestImage(song: Song): string | null {
  if (!song || !song.image || !Array.isArray(song.image) || song.image.length === 0) return null;
  const best = song.image[song.image.length - 1];
  return best?.link || best?.url || null;
}

export function getBestDownload(song: Song): string {
  if (!song || !song.downloadUrl || !Array.isArray(song.downloadUrl) || song.downloadUrl.length === 0) return '';
  const best = song.downloadUrl[song.downloadUrl.length - 1];
  return best?.link || best?.url || '';
}

export function getArtistNames(song: Song) {
  if (!song || !song.artists?.primary) return 'Unknown Artist';
  return song.artists.primary.map(a => a.name).join(', ');
}
