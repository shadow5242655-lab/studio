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
const PLAYED_FILES_KEY = 'ayumusic_played_audio_files';
const HISTORY_LIMIT = 50;
const RECENT_LIMIT = 30;
const RECENT_HYBRID_LIMIT = 30;
const AUTO_BLOCK_THRESHOLD = 3;

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
    // storage unavailable
  }
}

// ============================================================================
// HYBRID KEY GENERATION
// ============================================================================

function extractAudioFilename(url: string): string {
  if (!url) return '';
  try {
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    const pathPart = withoutProtocol.split('?')[0];
    const segments = pathPart.split('/');
    const filename = segments[segments.length - 1] || '';
    return filename.toLowerCase();
  } catch {
    return '';
  }
}

export function generateHybridKey(song: Song): string {
  const title = (song.name || '').toLowerCase().trim();
  const artist = (song.artists?.primary?.[0]?.name || '').toLowerCase().trim();
  const duration = Math.round(song.duration || 0);
  const downloadUrl = getBestDownload(song);
  const audioFilename = extractAudioFilename(downloadUrl);

  if (audioFilename) {
    return `${title}|${artist}|${duration}|${audioFilename}`;
  }
  return `${title}|${artist}|${duration}`;
}

// Get just the audio filename for direct filename-based dedup
export function getAudioFilename(song: Song): string {
  const downloadUrl = getBestDownload(song);
  return extractAudioFilename(downloadUrl);
}

// ============================================================================
// PLAYED AUDIO FILES SET (STRONGEST DEDUP)
// ============================================================================
// Stores audio filenames of all played songs.
// Same filename = same audio file = same song, regardless of metadata.
// This catches duplicates that have different title/artist but same audio.
// ============================================================================

function getPlayedAudioFiles(): string[] {
  const raw = safeGet(PLAYED_FILES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addPlayedAudioFile(filename: string): void {
  if (!filename) return;
  const list = getPlayedAudioFiles().filter(f => f !== filename);
  list.unshift(filename);
  safeSet(PLAYED_FILES_KEY, JSON.stringify(list.slice(0, 50)));
}

// ============================================================================
// RECENTLY PLAYED HYBRID KEYS
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
// DETECTION COUNTER
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

export function isDuplicate(hybridKey: string): boolean {
  if (!hybridKey) return false;

  // Check 1: Permanently blocked?
  const blocked = getBlockedSongs();
  if (blocked.includes(hybridKey)) {
    console.log('🚫 AYUMUSIC: BLOCKED permanently:', hybridKey);
    return true;
  }

  // Check 2: Recently played?
  const recent = getRecentlyPlayedHybrid();
  if (recent.includes(hybridKey)) {
    const count = incrementDetection(hybridKey);
    console.log(`🔄 AYUMUSIC: Duplicate (${count}/${AUTO_BLOCK_THRESHOLD}):`, hybridKey);
    if (count >= AUTO_BLOCK_THRESHOLD) {
      addBlockedSong(hybridKey);
      console.log(`🚫 AYUMUSIC: AUTO-BLOCKED after ${count} detections:`, hybridKey);
    }
    return true;
  }

  return false;
}

/**
 * Check if a song's audio filename has been played before.
 * This is the STRONGEST dedup check — same filename = same audio file.
 * Catches duplicates where the hybrid key differs but the audio is identical.
 */
export function isAudioFilePlayed(song: Song): boolean {
  const filename = getAudioFilename(song);
  if (!filename) return false;
  const played = getPlayedAudioFiles();
  if (played.includes(filename)) {
    console.log('🚫 AYUMUSIC: Audio file already played:', filename);
    return true;
  }
  return false;
}

/**
 * Combined check: is this song a duplicate by ANY method?
 * Checks: blocked, recently played (hybrid key), and audio filename.
 */
export function isSongDuplicate(song: Song): boolean {
  const hybridKey = generateHybridKey(song);
  if (isDuplicate(hybridKey)) return true;
  if (isAudioFilePlayed(song)) return true;
  return false;
}

// ============================================================================
// RECORD A PLAY
// ============================================================================

export function recordPlay(song: Song): void {
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

  // Update recently played hybrid keys
  const hybridKey = generateHybridKey(song);
  addRecentlyPlayedHybrid(hybridKey);

  // Update played audio files (STRONGEST dedup)
  const filename = getAudioFilename(song);
  addPlayedAudioFile(filename);

  console.log('✅ AYUMUSIC: Recorded:', song.name, '| Key:', hybridKey, '| File:', filename);
}

// ============================================================================
// FILTER SONGS BY DEDUP STATUS
// ============================================================================

export function filterUniqueSongs(songs: Song[]): Song[] {
  const recent = getRecentlyPlayedHybrid();
  const blocked = getBlockedSongs();
  const playedFiles = getPlayedAudioFiles();
  const seen = new Set<string>();
  const seenFiles = new Set<string>();

  return songs.filter(song => {
    if (!song?.id) return false;
    const key = generateHybridKey(song);
    const filename = getAudioFilename(song);

    // Skip if already seen in this batch
    if (seen.has(key)) return false;
    if (filename && seenFiles.has(filename)) return false;

    // Skip if recently played
    if (recent.includes(key)) return false;

    // Skip if permanently blocked
    if (blocked.includes(key)) return false;

    // Skip if audio file was already played (STRONGEST check)
    if (filename && playedFiles.includes(filename)) return false;

    seen.add(key);
    if (filename) seenFiles.add(filename);
    return true;
  });
}

// ============================================================================
// LEGACY FUNCTIONS
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
