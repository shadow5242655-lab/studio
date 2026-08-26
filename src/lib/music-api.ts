
export interface Song {
  id: string;
  name: string;
  artists: { primary: { name: string; id?: string }[] };
  image: { link: string; url?: string; quality: string }[];
  downloadUrl: { link: string; url?: string; quality: string }[];
  duration: number;
  mood?: string;
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
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('AYUMUSIC API: Search failed:', error);
    return [];
  }
}

export async function searchAlbums(query: string, page: number = 1): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('AYUMUSIC API: Album search failed:', error);
    return [];
  }
}

export async function searchArtists(query: string, page: number = 1): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('AYUMUSIC API: Artist search failed:', error);
    return [];
  }
}

export async function searchPlaylists(query: string, page: number = 1): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('AYUMUSIC API: Playlist search failed:', error);
    return [];
  }
}

export async function getTrending(page: number = 1): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=Latest%20Top%20Trending%20Hits&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('AYUMUSIC API: Trending fetch failed:', error);
    return [];
  }
}

export async function fetchAudiusMoodTracks(mood: string): Promise<Song[]> {
  try {
    console.log(`AYUMUSIC API: Fetching Audius resonance for: "${mood}"`);
    const res = await fetch(`${AUDIUS_API_BASE}/tracks/search?query=${encodeURIComponent(mood)}&limit=20`);
    const data = await res.json();
    
    if (!data.data) return [];

    return data.data.map((track: any) => ({
      id: String(track.id),
      name: track.title,
      artists: { primary: [{ name: track.user.name, id: track.user.id }] },
      image: [{ link: track.artwork?.['480x480'] || track.artwork?.['150x150'] || 'https://picsum.photos/seed/audius/400/400', quality: 'high' }],
      downloadUrl: [{ link: `${AUDIUS_API_BASE}/tracks/${track.id}/stream`, quality: 'high' }],
      duration: Math.floor(track.duration),
      mood: mood
    }));
  } catch (error) {
    console.error('AYUMUSIC API: Audius resonance failed:', error);
    return [];
  }
}

export async function getLyrics(songId: string): Promise<{ plain: string; synced: { time: number; text: string }[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/songs/${songId}/lyrics`);
    const data = await res.json();
    if (!data.data) return null;

    const lyricsText = data.data.lyrics || data.data;
    if (typeof lyricsText !== 'string') return null;
    
    const synced: { time: number; text: string }[] = [];
    const lines = lyricsText.split('\n');
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

    lines.forEach((line: string) => {
      const match = line.match(timeRegex);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        const time = minutes * 60 + seconds + milliseconds / (match[3].length === 3 ? 1000 : 100);
        synced.push({ time, text: match[4].trim() });
      }
    });

    return {
      plain: synced.length === 0 ? lyricsText : '',
      synced: synced.sort((a, b) => a.time - b.time)
    };
  } catch (error) {
    console.warn('AYUMUSIC API: Lyrics resolution failed for ID:', songId);
    return null;
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
    return '';
  }
  const best = song.downloadUrl[song.downloadUrl.length - 1];
  return best?.link || best?.url || '';
}
