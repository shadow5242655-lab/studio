export interface Song {
  id: string;
  name: string;
  artists: { primary: { name: string; id?: string }[] };
  image: { link: string; url?: string; quality: string }[];
  downloadUrl: { link: string; url?: string; quality: string }[];
  duration: number;
  rankType?: 'ORIGINAL' | 'COVER' | 'ALTERNATE';
}

export interface Album {
  id: string;
  name: string;
  artists: { primary: { name: string; id?: string }[] };
  image: { link: string; url?: string; quality: string }[];
  year?: string;
}

export interface PlaylistResult {
  id: string;
  name: string;
  image: { link: string; url?: string; quality: string }[];
  songCount?: string;
  firstname?: string;
}

export interface ArtistDetails {
  id: string;
  name: string;
  image: { link: string; url?: string; quality: string }[];
  followerCount?: string;
  isVerified?: boolean;
  bio?: string;
  topSongs?: Song[];
  topAlbums?: Album[];
}

export interface LyricsData {
  synced?: { time: number; text: string }[];
  plain?: string;
  id?: number;
}

const API_BASE = 'https://jiosvvnn.vercel.app/api';
const LYRICS_API = 'https://lrclib.net/api/get';

/**
 * SmartRank3 Logic: Categorizes songs based on title keywords.
 */
export function getSmartRank(song: Song): 'ORIGINAL' | 'COVER' | 'ALTERNATE' {
  const name = song.name.toLowerCase();
  if (name.includes('cover') || name.includes('tribute')) return 'COVER';
  if (name.includes('remix') || name.includes('acoustic') || name.includes('reprise') || name.includes('unplugged')) return 'ALTERNATE';
  return 'ORIGINAL';
}

/**
 * Sorts a song array using SmartRank3: Original > Covers > Alternate.
 */
export function sortSmartRank(songs: Song[]): Song[] {
  return [...songs].sort((a, b) => {
    const rankMap = { 'ORIGINAL': 0, 'COVER': 1, 'ALTERNATE': 2 };
    return rankMap[getSmartRank(a)] - rankMap[getSmartRank(b)];
  });
}

export async function searchSongs(query: string, page: number = 1): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    const results = data.data?.results || data.data || [];
    return Array.isArray(results) ? sortSmartRank(results) : [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

export async function searchAlbums(query: string, page: number = 1): Promise<Album[]> {
  try {
    const res = await fetch(`${API_BASE}/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    const results = data.data?.results || data.data || [];
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error('Album search failed:', error);
    return [];
  }
}

export async function searchPlaylists(query: string, page: number = 1): Promise<PlaylistResult[]> {
  try {
    const res = await fetch(`${API_BASE}/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    const results = data.data?.results || data.data || [];
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error('Playlist search failed:', error);
    return [];
  }
}

export async function getTrending(page: number = 1): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=Latest%20Trending%20Songs&page=${page}&limit=20`);
    const data = await res.json();
    const results = data.data?.results || data.data || [];
    return Array.isArray(results) ? sortSmartRank(results) : [];
  } catch (error) {
    console.error('Trending fetch failed:', error);
    return [];
  }
}

function parseLRC(lrc: string): { time: number; text: string }[] {
  const lines = lrc.split('\n');
  const result: { time: number; text: string }[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3]);
      const time = minutes * 60 + seconds + milliseconds / (match[3].length === 3 ? 1000 : 100);
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        result.push({ time, text });
      }
    }
  });
  return result.sort((a, b) => a.time - b.time);
}

export async function getLyrics(artist: string, title: string): Promise<LyricsData | null> {
  try {
    const res = await fetch(`${LYRICS_API}?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`);
    if (!res.ok) return null;
    const data = await res.json();
    
    return {
      synced: data.syncedLyrics ? parseLRC(data.syncedLyrics) : undefined,
      plain: data.plainLyrics || undefined,
      id: data.id
    };
  } catch (error) {
    console.error('Lyrics fetch failed:', error);
    throw error;
  }
}

export function formatDuration(seconds: number) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getBestImage(item: any): string | null {
  if (!item || !item.image || !Array.isArray(item.image) || item.image.length === 0) return null;
  const best = item.image[item.image.length - 1];
  return best?.link || best?.url || null;
}

export function getBestDownload(song: Song): string {
  if (!song || !song.downloadUrl || !Array.isArray(song.downloadUrl) || song.downloadUrl.length === 0) return '';
  const best = song.downloadUrl[song.downloadUrl.length - 1];
  return best?.link || best?.url || '';
}

export function getArtistNames(item: any) {
  if (!item) return 'Unknown';
  if (item.artists?.primary) {
    return item.artists.primary.map((a: any) => a.name).join(', ');
  }
  if (item.firstname) return item.firstname;
  return 'Various Artists';
}
