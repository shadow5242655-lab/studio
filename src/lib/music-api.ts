export interface Song {
  id: string;
  name: string;
  artists: { primary: { name: string; id?: string }[] };
  image: { link: string; url?: string; quality: string }[];
  downloadUrl: { link: string; url?: string; quality: string }[];
  duration: number;
}

const API_BASE = 'https://jiosvvnn.vercel.app/api';
const AUDIUS_API_BASE = 'https://api.audius.co/v1';

export function decodeEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&#039;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&copy;/gi, '©')
    .replace(/&reg;/gi, '®');
}

export async function searchSongs(query: string, page: number = 1): Promise<Song[]> {
  try {
    console.log(`AYUMUSIC API: Searching for "${query}" (Page: ${page})`);
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('AYUMUSIC API: Search failed:', error);
    return [];
  }
}

export async function getTrending(page: number = 1): Promise<Song[]> {
  try {
    console.log(`AYUMUSIC API: Fetching trending hits (Page: ${page})`);
    const res = await fetch(`${API_BASE}/search/songs?query=Latest%20Top%20Trending%20Hits&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('AYUMUSIC API: Trending fetch failed:', error);
    return [];
  }
}

/**
 * Fetches tracks from Audius based on a mood or keyword.
 * Normalizes the response to match the AYUMUSIC Song interface.
 */
export async function fetchAudiusMoodTracks(mood: string): Promise<Song[]> {
  try {
    console.log(`AYUMUSIC API: Fetching Audius resonance for mood: "${mood}"`);
    const res = await fetch(`${AUDIUS_API_BASE}/tracks/search?query=${encodeURIComponent(mood)}&limit=20`);
    const data = await res.json();
    
    if (!data.data) return [];

    return data.data.map((track: any) => ({
      id: track.id,
      name: track.title,
      artists: { primary: [{ name: track.user.name, id: track.user.id }] },
      image: [{ link: track.artwork?.['480x480'] || track.artwork?.['150x150'] || '', quality: 'high' }],
      downloadUrl: [{ link: `${AUDIUS_API_BASE}/tracks/${track.id}/stream`, quality: 'high' }],
      duration: track.duration,
    }));
  } catch (error) {
    console.error('AYUMUSIC API: Audius resonance failed:', error);
    return [];
  }
}

export function formatDuration(seconds: number) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getBestImage(item: any): string | null {
  if (!item?.image?.length) return null;
  const best = item.image[item.image.length - 1];
  return best?.link || best?.url || null;
}

export function getBestDownload(song: Song): string {
  if (!song?.downloadUrl?.length) {
    console.warn('AYUMUSIC API: No download URLs available for song:', song.id);
    return '';
  }
  const best = song.downloadUrl[song.downloadUrl.length - 1];
  const url = best?.link || best?.url || '';
  if (!url) {
    console.warn('AYUMUSIC API: Best download object contains no valid link:', best);
  }
  return url;
}
