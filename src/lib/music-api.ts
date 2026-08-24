export interface Song {
  id: string;
  name: string;
  artists: { primary: { name: string; id?: string }[] };
  image: { link: string; url?: string; quality: string }[];
  downloadUrl: { link: string; url?: string; quality: string }[];
  duration: number;
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

const API_BASE = 'https://jiosvvnn.vercel.app/api';

export async function searchSongs(query: string, page: number = 1): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}

export async function searchAlbums(query: string, page: number = 1): Promise<Album[]> {
  try {
    const res = await fetch(`${API_BASE}/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('Album search failed:', error);
    return [];
  }
}

export async function searchPlaylists(query: string, page: number = 1): Promise<PlaylistResult[]> {
  try {
    const res = await fetch(`${API_BASE}/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('Playlist search failed:', error);
    return [];
  }
}

export async function getArtistDetails(artistId: string): Promise<ArtistDetails | null> {
  try {
    const res = await fetch(`${API_BASE}/artists?id=${artistId}`);
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error('Artist details fetch failed:', error);
    return null;
  }
}

export async function getCharts(): Promise<PlaylistResult[]> {
  try {
    const res = await fetch(`${API_BASE}/search/playlists?query=Charts&limit=10`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('Charts fetch failed:', error);
    return [];
  }
}

export async function getTrending(page: number = 1): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=Top%20Hits&page=${page}&limit=20`);
    const data = await res.json();
    return data.data?.results || data.data || [];
  } catch (error) {
    console.error('Trending fetch failed:', error);
    return [];
  }
}

export async function getLyrics(songId: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/songs/${songId}/lyrics`);
    const data = await res.json();
    // Some responses wrap lyrics in data.lyrics, others just data.
    return data.data?.lyrics || (typeof data.data === 'string' ? data.data : null);
  } catch (error) {
    console.error('Lyrics fetch failed:', error);
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
