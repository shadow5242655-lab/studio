import { Song, getBestDownload } from '@/lib/music-api';

export interface HistoryEntry {
  songId: string;
  title: string;
  artist: string;
  timestamp: number;
}

// ============================================================================
// LOCALSTORAGE KEYS
// ============================================================================
const HISTORY_KEY = 'ayumusic_listening_history';
const RECENT_KEY = 'ayumusic_recently_played';
const RECENT_HYBRID_KEY = 'ayumusic_recently_played_hybrid';
const BLOCKED_KEY = 'ayumusic_blocked_songs';
const DETECTION_KEY = 'ayumusic_detection_counter';
const HISTORY_LIMIT = 50;
const RECENT_LIMIT = 30;
const RECENT_HYBRID_LIMIT = 30;
const AUTO_BLOCK_THRESHOLD = 3; // Auto-block after 3 duplicate detections

// ============================================================================
// SAFE LOCALSTORAGE ACCESS
// ============================================================================
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

// ============================================================================
// HYBRID KEY GENERATION
// ============================================================================
// A hybrid key uniquely identifies a song using MULTIPLE metadata fields.
// This catches duplicates even when the same audio appears with different
// title, artist, or image metadata.
//
// Format: "normalized_title|normalized_artist|rounded_duration|audio_filename"
//
// Components:
// 1. normalized_title  — lowercase, trimmed song title
// 2. normalized_artist — lowercase, trimmed primary artist name
// 3. rounded_duration  — duration in seconds, rounded to nearest integer
// 4. audio_filename    — base filename extracted from the download URL
//                        (e.g., "be4d53a67d85481c1a571684e4c473fd_160.mp4")
//                        This is the strongest dedup signal — same audio file
//                        = same song, regardless of metadata changes.
// ============================================================================

/**
 * Extract the base audio filename from a download URL.
 * Removes protocol, domain, path prefix, and query parameters.
 * Example:
 *   "https://cdn.jiosaavn.com/songs/be4d53a67d85481c1a571684e4c473fd_160.mp4?x-ai=..."
 *   → "be4d53a67d85481c1a571684e4c473fd_160.mp4"
 */
function extractAudioFilename(url: string): string {
  if (!url) return '';
  try {
    // Remove protocol and domain
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    // Get the path part (before query string)
    const pathPart = withoutProtocol.split('?')[0];
    // Get just the filename (last segment of the path)
    const segments = pathPart.split('/');
    const filename = segments[segments.length - 1] || '';
    return filename.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Generate a hybrid unique key for a song.
 * Uses: title + artist + duration + audio filename.
 *
 * The audio filename is the STRONGEST signal — same file = same song.
 * Duration is the SECOND strongest — same length = likely same song.
 * Title + artist provide the remaining identification.
 *
 * If the download URL is not available, the key falls back to
 * title + artist + duration (still much stronger than ID alone).
 */
export function generateHybridKey(song: Song): string {
  const title = (song.name || '').toLowerCase().trim();
  const artist = (song.artists?.primary?.[0]?.name || '').toLowerCase().trim();
  const duration = Math.round(song.duration || 0);

  // Extract audio filename from download URL (strongest dedup signal)
  const downloadUrl = getBestDownload(song);
  const audioFilename = extractAudioFilename(downloadUrl);

  // Build the hybrid key
  // If we have the audio filename, it's the primary identifier
  if (audioFilename) {
    return `${title}|${artist}|${duration}|${audioFilename}`;
  }

  // Fallback: title + artist + duration (still catches most duplicates)
  return `${title}|${artist}|${duration}`;
}

// ============================================================================
// RECENTLY PLAYED HYBRID KEYS
// ============================================================================
// Stores the last 30 hybrid keys in localStorage.
// Checked BEFORE playing any song — if the hybrid key is in this list,
// the song is a duplicate and must be skipped.
// ============================================================================

export function getRecentlyPlayedHybrid(): string[] {
  const raw = safeGet(RECENT_HYBRID_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addRecentlyPlayedHybrid(hybridKey: string): void {
  if (!hybridKey) return;
  const list = getRecentlyPlayedHybrid().filter(k => k !== hybridKey);
  list.unshift(hybridKey);
  safeSet(RECENT_HYBRID_KEY, JSON.stringify(list.slice(0, RECENT_HYBRID_LIMIT)));
}

// ============================================================================
// BLOCKED SONGS (PERMANENT BLOCKLIST)
// ============================================================================
// Stores hybrid keys of songs that should NEVER play again.
// Persisted permanently in localStorage — survives page refreshes.
// A song is added here when it's detected as a duplicate 3+ times.
// ============================================================================

export function getBlockedSongs(): string[] {
  const raw = safeGet(BLOCKED_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addBlockedSong(hybridKey: string): void {
  if (!hybridKey) return;
  const list = getBlockedSongs().filter(k => k !== hybridKey);
  list.unshift(hybridKey);
  safeSet(BLOCKED_KEY, JSON.stringify(list));
}

export function removeBlockedSong(hybridKey: string): void {
  const list = getBlockedSongs().filter(k => k !== hybridKey);
  safeSet(BLOCKED_KEY, JSON.stringify(list));
}

export function clearBlockedSongs(): void {
  safeSet(BLOCKED_KEY, JSON.stringify([]));
}

// ============================================================================
// DETECTION COUNTER (AUTO-BLOCK AFTER 3 DUPLICATE DETECTIONS)
// ============================================================================
// Tracks how many times each hybrid key has been detected as a duplicate.
// When a key reaches 3 detections, it's automatically added to blockedSongs.
// This prevents the same song from反复 appearing with different metadata.
// ============================================================================

interface DetectionMap {
  [hybridKey: string]: number;
}

function getDetectionCounter(): DetectionMap {
  const raw = safeGet(DETECTION_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function incrementDetection(hybridKey: string): number {
  const counter = getDetectionCounter();
  counter[hybridKey] = (counter[hybridKey] || 0) + 1;
  safeSet(DETECTION_KEY, JSON.stringify(counter));
  return counter[hybridKey];
}

// ============================================================================
// CHECK IF A SONG IS A DUPLICATE
// ============================================================================
// Returns true if the song should be BLOCKED from playing.
// Checks: blockedSongs FIRST, then recentlyPlayedHybrid.
// Also increments the detection counter and auto-blocks if threshold reached.
// ============================================================================

export function isDuplicate(hybridKey: string): boolean {
  if (!hybridKey) return false;

  // Check 1: Is this song permanently blocked?
  const blocked = getBlockedSongs();
  if (blocked.includes(hybridKey)) {
    console.log('🚫 AYUMUSIC: Song is BLOCKED permanently:', hybridKey);
    return true;
  }

  // Check 2: Was this song recently played?
  const recent = getRecentlyPlayedHybrid();
  if (recent.includes(hybridKey)) {
    // Increment detection count
    const count = incrementDetection(hybridKey);
    console.log(`🔄 AYUMUSIC: Duplicate detected (${count}/${AUTO_BLOCK_THRESHOLD}):`, hybridKey);

    // Auto-block after threshold reached
    if (count >= AUTO_BLOCK_THRESHOLD) {
      addBlockedSong(hybridKey);
      console.log(`🚫 AYUMUSIC: AUTO-BLOCKED song after ${count} detections:`, hybridKey);
    }
    return true;
  }

  return false;
}

// ============================================================================
// RECORD A PLAY
// ============================================================================
// Saves the song to:
// 1. Listening history (for top artists calculation)
// 2. Recently played IDs (secondary check)
// 3. Recently played hybrid keys (PRIMARY dedup check)
// ============================================================================

export function recordPlay(song: Song): void {
  if (!song?.id) return;
  const artist = song.artists?.primary?.[0]?.name || 'Unknown';

  // Update listening history
  const history = getListeningHistory().filter(h => h.songId !== song.id);
  history.unshift({ songId: song.id, title: song.name, artist, timestamp: Date.now() });
  safeSet(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));

  // Update recently played IDs (secondary check)
  const recent = getRecentlyPlayedIds().filter(id => id !== song.id);
  recent.unshift(song.id);
  safeSet(RECENT_KEY, JSON.stringify(recent.slice(0, RECENT_LIMIT)));

  // Update recently played hybrid keys (PRIMARY dedup check)
  const hybridKey = generateHybridKey(song);
  addRecentlyPlayedHybrid(hybridKey);

  console.log('✅ AYUMUSIC: Recorded play:', song.name, '| Hybrid key:', hybridKey);
}

// ============================================================================
// FILTER SONGS BY DEDUP STATUS
// ============================================================================
// Filters out songs that are duplicates (in recentlyPlayedHybrid or blockedSongs).
// Used before displaying Daily Picks, search results, and recommendations.
// ============================================================================

export function filterUniqueSongs(songs: Song[]): Song[] {
  const recent = getRecentlyPlayedHybrid();
  const blocked = getBlockedSongs();
  const seen = new Set<string>();

  return songs.filter(song => {
    if (!song?.id) return false;
    const key = generateHybridKey(song);
    // Skip if already seen in this batch (internal dedup)
    if (seen.has(key)) return false;
    // Skip if recently played
    if (recent.includes(key)) return false;
    // Skip if permanently blocked
    if (blocked.includes(key)) return false;
    seen.add(key);
    return true;
  });
}

// ============================================================================
// LEGACY FUNCTIONS (kept for backward compatibility)
// ============================================================================

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
