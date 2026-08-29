'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Song, searchSongs, getBestImage, decodeEntities, formatDuration, getTrending } from '@/lib/music-api';
import { getTopArtists, getRecentlyPlayedIds } from '@/lib/listening-history';
import { Play, Clock } from 'lucide-react';
import { useMusic } from '@/components/music-player/player-context';

/**
 * PERSONALIZED DAILY PICKS — Vertical List
 *
 * Flow:
 * 1. Read listening history from localStorage.
 * 2. Identify the user's top 3-5 most-played artists.
 * 3. Use JioSaavn search API to fetch 5-6 songs per artist.
 * 4. Combine results, remove duplicates (song ID), remove recently played (last 20).
 * 5. Select 10-12 unique songs, shuffle, display as a vertical list.
 * 6. Refresh once per day (store date in localStorage).
 * 7. If no history, show trending/popular songs or a message.
 */

const DAILY_PICKS_KEY = 'ayumusic_daily_picks_date';
const DAILY_PICKS_DATA_KEY = 'ayumusic_daily_picks_data';
const PICKS_PER_ARTIST = 6;
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

function uniqueById(list: Song[]): Song[] {
  const map = new Map<string, Song>();
  list.forEach(s => {
    if (s?.id) map.set(s.id, s);
  });
  return Array.from(map.values());
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
  const { currentTrack, isPlaying } = useMusic();

  const fetchDailyPicks = useCallback(async () => {
    setLoading(true);

    // Step 1: Check if we already have today's picks cached
    const cached = loadCachedPicks();
    if (cached && cached.length > 0) {
      setSongs(cached);
      setLoading(false);
      return;
    }

    // Step 2: Get top artists from listening history
    const topArtists = getTopArtists(TOP_ARTISTS_COUNT);
    const artistNames = topArtists.map(t => t.artist).filter(Boolean);

    if (artistNames.length > 0) {
      setIsFromHistory(true);

      try {
        // Step 3: Fetch 5-6 songs per artist from JioSaavn API
        const artistQueries = artistNames.map(name => `${name} songs`);
        const results = await Promise.all(
          artistQueries.map(query => searchSongs(query, 1))
        );

        // Step 4: Combine all results
        const allSongs = results.flat();

        // Step 5: Remove duplicates by song ID
        const uniqueSongs = uniqueById(allSongs);

        // Step 6: Remove recently played songs (last 20)
        const recentIds = getRecentlyPlayedIds().slice(0, RECENT_EXCLUDE_COUNT);
        const freshSongs = uniqueSongs.filter(s => !recentIds.includes(s.id));

        // Step 7: Shuffle and pick 10-12 unique songs
        const shuffled = shuffleArray(freshSongs.length > 0 ? freshSongs : uniqueSongs);
        const finalPicks = shuffled.slice(0, FINAL_PICK_COUNT);

        if (finalPicks.length > 0) {
          setSongs(finalPicks);
          saveCachedPicks(finalPicks);
        } else {
          // Fallback to trending if no picks available
          const trending = await getTrending();
          const trendingFresh = trending.filter(s => !recentIds.includes(s.id));
          const finalTrending = shuffleArray(trendingFresh.length > 0 ? trendingFresh : trending).slice(0, FINAL_PICK_COUNT);
          setSongs(finalTrending);
          setIsFromHistory(false);
          saveCachedPicks(finalTrending);
        }
      } catch (error) {
        console.error('AYUMUSIC: Daily Picks fetch failed:', error);
        // Fallback to trending on error
        try {
          const trending = await getTrending();
          setSongs(trending.slice(0, FINAL_PICK_COUNT));
          setIsFromHistory(false);
        } catch {
          setSongs([]);
        }
      }
    } else {
      // No listening history — show trending songs
      setIsFromHistory(false);
      try {
        const trending = await getTrending();
        setSongs(trending.slice(0, FINAL_PICK_COUNT));
        saveCachedPicks(trending.slice(0, FINAL_PICK_COUNT));
      } catch (error) {
        console.error('AYUMUSIC: Trending fallback failed:', error);
        setSongs([]);
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
        </div>
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-neutral-900 animate-pulse rounded-2xl" />
          ))}
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
