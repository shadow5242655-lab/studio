/**
 * Spotify Search Integration
 * 
 * Calls our Next.js API route /api/spotify/search which handles
 * Spotify client credentials auth server-side (keeps secrets safe).
 * 
 * Spotify results are converted to our Song format.
 * Spotify tracks can be identified by their 22-char alphanumeric ID.
 */

import { Song, attachMood } from './music-api';

const SPOTIFY_SEARCH_API = '/api/spotify/search';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { primary: { name: string; id?: string }[] };
  image: { link: string; url?: string; quality: string }[];
  downloadUrl: { link: string; quality: string }[];
  duration: number;
  _spotify?: {
    trackId: string;
    previewUrl?: string;
    externalUrl?: string;
    albumName?: string;
    releaseDate?: string;
    explicit?: boolean;
    popularity?: number;
  };
}

/**
 * Search songs on Spotify via our API proxy.
 * Returns songs in our standard Song format.
 */
export async function searchSpotifySongs(query: string, limit: number = 30): Promise<Song[]> {
  try {
    const res = await fetch(`${SPOTIFY_SEARCH_API}?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) return [];

    const data = await res.json();
    const tracks: SpotifyTrack[] = data.tracks || [];

    return tracks.map((track) =>
      attachMood({
        id: track.id,
        name: track.name,
        artists: track.artists,
        image: track.image,
        downloadUrl: track.downloadUrl,
        duration: track.duration,
      }, query)
    );
  } catch (error) {
    console.warn('AYUMUSIC: Spotify search failed', error);
    return [];
  }
}
