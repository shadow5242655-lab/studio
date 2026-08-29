'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Song, searchSongs, getBestImage, getBestDownload, getSongUrl, decodeEntities, formatDuration, getTrending } from '@/lib/music-api';
import { getTopArtists, getRecentlyPlayedIds, getRecentlyPlayedUrls, normalizeAudioUrl } from '@/lib/listening-history';
import { Play, Clock } from 'lucide-react';
import { useMusic } from '@/components/music-player/player-context';

/**
 * PERSONALIZED DAILY PICKS — Vertical List
 *
 * Flow:
 * 1. Read listening history from localStorage.
 * 2. Identify the user's top 3-5 most-played artists.
 * 3. Use JioSaavn search API to fetch songs per artist.
 * 4. For each song, resolve its auth_url using getSongUrl().
 * 5. Deduplicate by normalized auth_url (PRIMARY key) and song ID (SECONDARY key).
 * 6. Remove recently played songs (last 20 IDs + all recently played URLs).
 * 7. Select 10-12 unique songs, shuffle, display as a vertical list.
 * 8. Refresh once per day (store date in localStorage).
 * 9. If no history, show trending/popular songs.
 * 10. Fallback: "No new songs available. Try again later."
 *
 * CRITICAL: auth_url is the ONLY reliable dedup key.
 * Two songs with different metadata but the same audio URL are the same song.
 */

const DAILY_PICKS_KEY = 'ayumusic_daily_picks_date';
const DAILY_PICKS_DATA_KEY = 'ayumusic_daily_picks_data';
const TOP_ARTISTS_COUNT = 5;
const FINAL_PICK_COUNT = 12;
const RECENT_EXCLUDE_COUNT = 20;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Deduplicate songs by resolving each song's auth_url and comparing normalized URLs.
 * auth_url is the PRIMARY dedup key — song ID is SECONDARY.
 */
async function deduplicateByResolvedUrl(songs: Song[]): Promise<Song[]> {
  const seenUrls = new Set<string>();
  const seenIds = new Set<string>();
  const result: Song[] = [];

  // Resolve all URLs in parallel (batch of 10 to avoid overwhelming)
  const BATCH_SIZE = 10;
  for (let i = 0; i < songs.length; i += BATCH_SIZE) {
    const batch = songs.slice(i, i + BATCH_SIZE);
    const urls = await Promise.all(batch.map(s => getSongUrl(s)));
    batch.forEach((song, j) => {
      if (!song?.id) return;
      // Check song ID
      if (seenIds.has(song.id)) return;
      // Check normalized audio URL (PRIMARY)
      const url = urls[j];
      const norm = url ? normalizeAudioUrl(url) : '';
      if (norm && seenUrls.has(norm)) return;
      seenIds.add(song.id);
      if (norm) seenUrls.add(norm);
      result.push(song);
    });
  }
  return result;
}

/**
 * Filter out recently played songs by both ID and resolved audio URL.
 */
async function filterRecentlyPlayed(songs: Song[]): Promise<Song[]> {
  const recentIds = getRecentlyPlayedIds().slice(0, RECENT_EXCLUDE_COUNT);
  const recentUrls = getRecentlyPlayedUrls();

  const BATCH_SIZE = 10;
  const result: Song[] = [];
  for (let i = 0; i < songs.length; i += BATCH_SIZE) {
    const batch = songs.slice(i, i + BATCH_SIZE);
    const urls = await Promise.all(batch.map(s => getSongUrl(s)));
    batch.forEach((song, j) => {
      if (recentIds.includes(song.id)) return;
      const url = urls[j];
      const norm = url ? normalizeAudioUrl(url) : '';
      if (norm && recentUrls.includes(norm)) return;
      result.push(song);
    });
  }
  return result;
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function loadCachedPicks(): Song[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const storedDate = localStorage.getItem(DAILY_PICKS_KEY);
    const storedData = localStorage.getItem(DAILY_PICKS_DATA_KEY);
    if (storedDate && storedData && storedDate === getTodayString()) {
      const parsed = JSON.parse(storedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Song[];
      }
    }
  } catch {
    // corrupted data — refetch
  }
  return null;
}

function saveCachedPicks(songs: Song[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DAILY_PICKS_KEY, getTodayString());
    localStorage.setItem(DAILY_PICKS_DATA_KEY, JSON.stringify(songs));
  } catch {
    // storage unavailable — ignore
  }
}

interface PersonalizedDailyPicksProps {
  onPlayTrack: (song: Song, list: Song[]) => void;
}

export default function PersonalizedDailyPicks({ onPlayTrack }: PersonalizedDailyPicksProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromHistory, setIsFromHistory] = useState(true);
  const [noSongsMessage, setNoSongsMessage] = useState('');
  const { currentTrack, isPlaying } = useMusic();

  const fetchDailyPicks = useCallback(async () => {
    setLoading(true);
    setNoSongsMessage('');

    // Step 1: Check cache
    const cached = loadCachedPicks();
    if (cached && cached.length > 0) {
      setSongs(cached);
      setLoading(false);
      return;
    }

    // Step 2: Get top artists
    const topArtists = getTopArtists(TOP_ARTISTS_COUNT);
    const artistNames = topArtists.map(t => t.artist).filter(Boolean);

    try {
      let candidateSongs: Song[] = [];

      if (artistNames.length > 0) {
        setIsFromHistory(true);
        // Step 3: Fetch songs per artist
        const results = await Promise.all(
          artistNames.map(name => searchSongs(`${name} songs`, 1))
        );
        candidateSongs = results.flat();
      } else {
        // No history — use trending
        setIsFromHistory(false);
        candidateSongs = await getTrending();
      }

      // Step 4: Deduplicate by resolved auth_url
      const uniqueSongs = await deduplicateByResolvedUrl(candidateSongs);

      // Step 5: Filter out recently played
      const freshSongs = await filterRecentlyPlayed(uniqueSongs);

      // Step 6: Shuffle and pick
      const pool = freshSongs.length > 0 ? freshSongs : uniqueSongs;
      const shuffled = shuffleArray(pool);
      const finalPicks = shuffled.slice(0, FINAL_PICK_COUNT);

      if (finalPicks.length > 0) {
        setSongs(finalPicks);
        saveCachedPicks(finalPicks);
      } else {
        // Fallback: try trending
        const trending = await getTrending();
        const uniqueTrending = await deduplicateByResolvedUrl(trending);
        const freshTrending = await filterRecentlyPlayed(uniqueTrending);
        const trendingPool = freshTrending.length > 0 ? freshTrending : uniqueTrending;
        const finalTrending = shuffleArray(trendingPool).slice(0, FINAL_PICK_COUNT);

        if (finalTrending.length > 0) {
          setSongs(finalTrending);
          setIsFromHistory(false);
          saveCachedPicks(finalTrending);
        } else {
          // Absolute fallback: show message
          setNoSongsMessage('No new songs available. Try again later.');
        }
      }
    } catch (error) {
      console.error('AYUMUSIC: Daily Picks fetch failed:', error);
      // Try one last fallback
      try {
        const trending = await getTrending();
        const unique = await deduplicateByResolvedUrl(trending);
        if (unique.length > 0) {
          setSongs(unique.slice(0, FINAL_PICK_COUNT));
          setIsFromHistory(false);
        } else {
          setNoSongsMessage('No new songs available. Try again later.');
        }
      } catch {
        setNoSongsMessage('No new songs available. Try again later.');
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchDailyPicks();
  }, [fetchDailyPicks]);

  if (loading) {
    return (
      <section className="space-y-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black italic uppercase tracking-tighter">📅 Your Daily Picks</span>
          </div>
          <div className="h-8 w-24 bg-neutral-900 animate-pulse rounded-full" />
        </div>
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-neutral-900 animate-pulse rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  // Show fallback message if no songs available
  if (noSongsMessage) {
    return (
      <section className="space-y-4 px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black italic uppercase tracking-tighter">📅 Your Daily Picks</span>
        </div>
        <div className="py-12 text-center">
          <p className="text-sm text-neutral-500 italic">{noSongsMessage}</p>
        </div>
      </section>
    );
  }

  if (!songs.length) return null;

  return (
    <section className="space-y-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black italic uppercase tracking-tighter">📅 Your Daily Picks</span>
          {!isFromHistory && (
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
              — Trending
            </span>
          )}
        </div>
        <button
          onClick={() => songs.length > 0 && onPlayTrack(songs[0], songs)}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary hover:bg-primary/20 transition-colors"
        >
          <Play className="h-3 w-3 fill-current" />
          <span className="text-[10px] font-black uppercase tracking-widest">Play All</span>
        </button>
      </div>

      <div className="space-y-3">
        {songs.map((song, idx) => {
          const isCurrentSong = currentTrack?.id === song.id;

          return (
            <div
              key={`${song.id}-${idx}`}
              onClick={() => onPlayTrack(song, songs)}
              className={`flex items-center gap-4 group cursor-pointer active:bg-white/5 p-3 rounded-2xl transition-colors border ${
                isCurrentSong
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-[#121212] border-white/5 hover:bg-white/[0.03]'
              }`}
            >
              {/* Serial Number */}
              <div className="w-6 text-center shrink-0">
                {isCurrentSong && isPlaying ? (
                  <div className="flex gap-0.5 items-end justify-center h-4">
                    <div className="w-0.5 bg-primary animate-[bounce_0.6s_infinite_0s]" style={{ height: '60%' }} />
                    <div className="w-0.5 bg-primary animate-[bounce_0.6s_infinite_0.2s]" style={{ height: '100%' }} />
                    <div className="w-0.5 bg-primary animate-[bounce_0.6s_infinite_0.4s]" style={{ height: '40%' }} />
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Album Art Thumbnail */}
              <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 shadow-lg border border-white/5">
                <img
                  src={getBestImage(song) || ''}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-5 w-5 text-white fill-current" />
                </div>
              </div>

              {/* Song Title + Artist Name */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate italic uppercase tracking-tight ${
                  isCurrentSong ? 'text-primary' : 'text-white'
                }`}>
                  {decodeEntities(song.name)}
                </p>
                <p className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest mt-1">
                  {song.artists.primary[0]?.name || 'Unknown Artist'}
                </p>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Clock className="h-3 w-3 text-neutral-600" />
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                  {formatDuration(song.duration)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
