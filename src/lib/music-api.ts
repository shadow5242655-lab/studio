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

/**
 * Assigns a mood to a song based on its metadata or the context of the search.
 * Supported Moods: punjabi, romance, party, lofi, chill, energetic, haryanvi, desi, bhajan, sufi, pop, indie, rock.
 */
export function attachMood(song: Song, context?: string): Song {
  const text = (song.name + ' ' + (song.artists.primary[0]?.name || '') + ' ' + (context || '')).toLowerCase();
  
  let mood = 'pop';
  if (text.includes('punjabi') || text.includes('diljit') || text.includes('sidhu') || text.includes('karan aujla')) mood = 'punjabi';
  else if (text.includes('haryanvi') || text.includes('dhanda') || text.includes('sapna')) mood = 'haryanvi';
  else if (text.includes('love') || text.includes('romance') || text.includes('arijit') || text.includes('jubin')) mood = 'romance';
  else if (text.includes('lofi') || text.includes('chill') || text.includes('relax') || text.includes('study')) mood = 'lofi';
  else if (text.includes('bhajan') || text.includes('devotional') || text.includes('krishna') || text.includes('ram')) mood = 'bhajan';
  else if (text.includes('sufi') || text.includes('nusrat') || text.includes('rahut')) mood = 'sufi';
  else if (text.includes('party') || text.includes('dance') || text.includes('club') || text.includes('remix')) mood = 'party';
  else if (text.includes('gym') || text.includes('workout') || text.includes('energy') || text.includes('bass')) mood = 'energetic';
  else if (text.includes('indie') || text.includes('local') || text.includes('independent')) mood = 'indie';
  else if (text.includes('rock') || text.includes('metal') || text.includes('guitar')) mood = 'rock';
  else if (text.includes('desi') || text.includes('folk')) mood = 'desi';
  else if (text.includes('slow') || text.includes('peaceful')) mood = 'chill';
  
  return { ...song, mood };
}

export async function searchSongs(query: string, page: number = 1): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=50`);
    const data = await res.json();
    const results = data.data?.results || data.data || [];
    return results.map((s: Song) => attachMood(s, query));
  } catch (error) {
    console.error('AYUMUSIC API: Search failed:', error);
    return [];
  }
}

/**
 * Enhanced multi-query search that tries multiple search strategies
 * to maximize song coverage. Merges and deduplicates results.
 */
export async function enhancedSearchSongs(query: string): Promise<Song[]> {
  const seenIds = new Set<string>();
  const allSongs: Song[] = [];

  // Strategy 1: Search with the original query (highest limit)
  try {
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=1&limit=50`);
    const data = await res.json();
    const results = (data.data?.results || data.data || []) as Song[];
    for (const s of results) {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        allSongs.push(attachMood(s, query));
      }
    }
  } catch (e) { /* ignore */ }

  // Strategy 2: If query has multiple words, try splitting into parts
  // e.g. "Atif Aslam Tera Hone Laga Hoon" → try "Atif Aslam" and "Tera Hone Laga Hoon" separately
  const words = query.trim().split(/\s+/);
  if (words.length >= 3) {
    // Try the full query with page 2 for more results
    try {
      const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=2&limit=50`);
      const data = await res.json();
      const results = (data.data?.results || data.data || []) as Song[];
      for (const s of results) {
        if (!seenIds.has(s.id)) {
          seenIds.add(s.id);
          allSongs.push(attachMood(s, query));
        }
      }
    } catch (e) { /* ignore */ }

    // Try searching with different word splits to find more songs
    const halfIdx = Math.floor(words.length / 2);
    const splitQueries = [
      words.slice(0, halfIdx).join(' '),
      words.slice(halfIdx).join(' '),
    ];

    for (const sq of splitQueries) {
      if (sq === query) continue;
      try {
        const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(sq)}&page=1&limit=30`);
        const data = await res.json();
        const results = (data.data?.results || data.data || []) as Song[];
        for (const s of results) {
          if (!seenIds.has(s.id)) {
            seenIds.add(s.id);
            allSongs.push(attachMood(s, query));
          }
        }
      } catch (e) { /* ignore */ }
    }
  }

  return allSongs;
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
    const results = data.data?.results || data.data || [];
    return results.map((s: Song) => attachMood(s, 'trending'));
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

    return data.data.map((track: any) => attachMood({
      id: String(track.id),
      name: track.title,
      artists: { primary: [{ name: track.user.name, id: track.user.id }] },
      image: [{ link: track.artwork?.['480x480'] || track.artwork?.['150x150'] || 'https://picsum.photos/seed/audius/400/400', quality: 'high' }],
      downloadUrl: [{ link: `${AUDIUS_API_BASE}/tracks/${track.id}/stream`, quality: 'high' }],
      duration: Math.floor(track.duration),
    }, mood));
  } catch (error) {
    console.error('AYUMUSIC API: Audius resonance failed:', error);
    return [];
  }
}

const LRCLIB_API = 'https://lrclib.net/api';

/**
 * Parse LRC timestamp format [MM:SS.xx] into seconds.
 * Example: [01:23.45] → 83.45
 */
function parseLrcTime(timestamp: string): number {
  const match = timestamp.match(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/);
  if (!match) return 0;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
  return minutes * 60 + seconds + ms / 1000;
}

/**
 * Parse LRC synced lyrics string into an array of { time, text } objects.
 * LRC format: [01:23.45] Line of lyrics text
 */
function parseSyncedLyrics(lrc: string): { time: number; text: string }[] {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const result: { time: number; text: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match [MM:SS.xx] or [MM:SS] followed by text
    const match = trimmed.match(/\[([\d:.]+)\](.*)/);
    if (match) {
      const time = parseLrcTime(`[${match[1]}]`);
      const text = match[2].trim();
      if (text) {
        result.push({ time, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

/**
 * Fetch lyrics from LRCLIB API (no API key required).
 *
 * API: GET https://lrclib.net/api/search?q={artist} {title}
 * Returns: array of matched lyrics objects with syncedLyrics (LRC) and plainLyrics.
 *
 * Flow:
 * 1. Build query: "{artist} {title}" from the Song object.
 * 2. Call LRCLIB search API.
 * 3. Pick the first result that has syncedLyrics (for line-by-line display).
 * 4. If no synced lyrics, pick the first result with plainLyrics.
 * 5. Parse LRC format into { time, text }[] for synced, or return plain text.
 * 6. If no lyrics found, return null.
 */
export async function getLyrics(song: Song): Promise<{ plain: string; synced: { time: number; text: string }[] } | null> {
  try {
    const artist = song.artists?.primary?.[0]?.name || '';
    const title = song.name || '';
    if (!artist && !title) return null;

    // Build search query: "artist title"
    const query = `${artist} ${title}`.trim();
    console.log('AYUMUSIC LRCLIB: Searching lyrics for:', query);

    const res = await fetch(`${LRCLIB_API}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      console.warn('AYUMUSIC LRCLIB: API returned', res.status);
      return null;
    }

    const results = await res.json();
    if (!Array.isArray(results) || results.length === 0) {
      console.log('AYUMUSIC LRCLIB: No results found for:', query);
      return null;
    }

    // Pick the best match: prefer syncedLyrics, then plainLyrics
    let bestMatch: any = null;
    for (const result of results) {
      if (result.syncedLyrics) {
        bestMatch = result;
        break;
      }
      if (!bestMatch && result.plainLyrics) {
        bestMatch = result;
      }
    }

    if (!bestMatch) {
      console.log('AYUMUSIC LRCLIB: No lyrics content found for:', query);
      return null;
    }

    console.log('AYUMUSIC LRCLIB: Found lyrics by', bestMatch.artistName, '-', bestMatch.trackName);

    // Parse synced lyrics (LRC format → { time, text }[])
    const synced = parseSyncedLyrics(bestMatch.syncedLyrics || '');

    return {
      plain: synced.length === 0 ? (bestMatch.plainLyrics || '') : '',
      synced,
    };
  } catch (error) {
    console.warn('AYUMUSIC LRCLIB: Lyrics fetch failed for', song.name, error);
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

/**
 * Explicitly resolve the auth_url (audio URL) for a song.
 * This is the PRIMARY way to get the audio URL for deduplication.
 *
 * Flow:
 * 1. If the Song object already has downloadUrl data, use getBestDownload().
 * 2. If not, fetch the song details from the API to get the downloadUrl.
 * 3. Return the resolved URL (or empty string if unavailable).
 *
 * This ensures we always have the real auth_url before comparing.
 */
export async function getSongUrl(song: Song): Promise<string> {
  // Fast path: URL already available in the song object
  const existing = getBestDownload(song);
  if (existing) return existing;

  // Slow path: fetch song details from API to get downloadUrl
  try {
    const res = await fetch(`${API_BASE}/songs/${song.id}`);
    const data = await res.json();
    const songData = data.data;
    if (songData?.downloadUrl?.length) {
      const best = songData.downloadUrl[songData.downloadUrl.length - 1];
      return best?.link || best?.url || '';
    }
  } catch (e) {
    console.warn('AYUMUSIC: getSongUrl fetch failed for', song.id, e);
  }
  return '';
}

/**
 * Resolve auth_urls for multiple songs in parallel.
 * Returns a Map of song.id → resolved audio URL.
 * Used for upfront deduplication before display.
 */
export async function resolveSongUrls(songs: Song[]): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  const needsFetch = songs.filter(s => s?.id && !getBestDownload(s));
  const alreadyHave = songs.filter(s => s?.id && getBestDownload(s));

  // Fast path: populate URLs we already have
  alreadyHave.forEach(s => urlMap.set(s.id, getBestDownload(s)));

  // Slow path: fetch missing URLs in parallel
  if (needsFetch.length > 0) {
    const results = await Promise.allSettled(
      needsFetch.map(s => getSongUrl(s))
    );
    needsFetch.forEach((s, i) => {
      const result = results[i];
      if (result.status === 'fulfilled' && result.value) {
        urlMap.set(s.id, result.value);
      } else {
        // Fallback: try getBestDownload again
        urlMap.set(s.id, getBestDownload(s));
      }
    });
  }

  return urlMap;
}