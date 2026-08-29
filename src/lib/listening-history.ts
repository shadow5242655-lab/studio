import { Song } from '@/lib/music-api';

export interface HistoryEntry {
  songId: string;
  title: string;
  artist: string;
  timestamp: number;
}

const HISTORY_KEY = 'ayumusic_listening_history';
const RECENT_KEY = 'ayumusic_recently_played';
const RECENT_URLS_KEY = 'ayumusic_recently_played_urls';
const HISTORY_LIMIT = 50;
const RECENT_LIMIT = 25;
const RECENT_URLS_LIMIT = 25;

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode / quota) - ignore
  }
}

// --- Audio URL Normalization ---
// Strip protocol (http:// / https://) to normalize URLs for comparison.
// This ensures "http://cdn.example.com/song.mp3" and "https://cdn.example.com/song.mp3"
// are treated as the same audio source.
export function normalizeAudioUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '');
}

// --- Listening History ---
export function getListeningHistory(): HistoryEntry[] {
  const raw = safeGet(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// --- Recently Played Song IDs ---
export function getRecentlyPlayedIds(): string[] {
  const raw = safeGet(RECENT_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// --- Recently Played Audio URLs (PRIMARY dedup key) ---
// Stored as normalized URLs (without protocol) for fast comparison.
export function getRecentlyPlayedUrls(): string[] {
  const raw = safeGet(RECENT_URLS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addRecentlyPlayedUrl(url: string): void {
  if (!url) return;
  const normalized = normalizeAudioUrl(url);
  const urls = getRecentlyPlayedUrls().filter(u => u !== normalized);
  urls.unshift(normalized);
  safeSet(RECENT_URLS_KEY, JSON.stringify(urls.slice(0, RECENT_URLS_LIMIT)));
}

// Save a played song into listening history (max 50),
// recently played IDs (max 25), and recently played audio URLs (max 25).
export function recordPlay(song: Song, audioUrl?: string): void {
  if (!song?.id) return;
  const artist = song.artists?.primary?.[0]?.name || 'Unknown';

  // Update listening history
  const history = getListeningHistory().filter(h => h.songId !== song.id);
  history.unshift({ songId: song.id, title: song.name, artist, timestamp: Date.now() });
  safeSet(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));

  // Update recently played IDs
  const recent = getRecentlyPlayedIds().filter(id => id !== song.id);
  recent.unshift(song.id);
  safeSet(RECENT_KEY, JSON.stringify(recent.slice(0, RECENT_LIMIT)));

  // Update recently played audio URLs (PRIMARY dedup key)
  if (audioUrl) {
    addRecentlyPlayedUrl(audioUrl);
  }
}

// Returns top artists by play count, e.g. [{ artist: 'Arijit Singh', count: 12 }].
export function getTopArtists(limit: number = 3): { artist: string; count: number }[] {
  const counts = new Map<string, number>();
  getListeningHistory().forEach(h => {
    if (!h.artist || h.artist === 'Unknown') return;
    counts.set(h.artist, (counts.get(h.artist) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
