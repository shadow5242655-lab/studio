'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Song, searchSongs, getBestImage, getBestDownload, decodeEntities, getTrending } from '@/lib/music-api';
import { getTopArtists, getRecentlyPlayedIds, getRecentlyPlayedUrls, normalizeAudioUrl } from '@/lib/listening-history';
import { useMusic } from '@/components/music-player/player-context';
import { Play } from 'lucide-react';

/**
 * @fileOverview Homepage auto-recommendation sections driven by the user's
 * listening history (localStorage):
 *  1. "Recommended For You"  - songs by the user's top artist(s)
 *  2. "More from [Artist]"    - songs by the currently playing song's artist
 *  3. "Your Weekly Mix"       - combined query of the top 3 artists (grid)
 * Falls back to trending when there is no history.
 */

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Deduplicate songs by audio URL (PRIMARY key) and song ID (SECONDARY key).
 * Ensures songs with different metadata but same audio URL are treated as one.
 */
function deduplicateByAudioUrl(list: Song[]): Song[] {
  const seenUrls = new Set<string>();
  const seenIds = new Set<string>();
  return list.filter(s => {
    if (!s?.id) return false;
    if (seenIds.has(s.id)) return false;
    const url = normalizeAudioUrl(getBestDownload(s) || '');
    if (url && seenUrls.has(url)) return false;
    seenIds.add(s.id);
    if (url) seenUrls.add(url);
    return true;
  });
}

// Filter out recently played songs by both ID and audio URL.
function filterRecentlyPlayed(songs: Song[]): Song[] {
  const recentIds = getRecentlyPlayedIds();
  const recentUrls = getRecentlyPlayedUrls();
  return songs.filter(s => {
    if (recentIds.includes(s.id)) return false;
    const url = normalizeAudioUrl(getBestDownload(s) || '');
    if (url && recentUrls.includes(url)) return false;
    return true;
  });
}

// Horizontal scrollable card used by "Recommended For You" and "More from [Artist]".
const HorizontalRow = ({ songs, onPlayTrack, playingId }: {
  songs: Song[];
  onPlayTrack: (song: Song, list: Song[]) => void;
  playingId?: string | null;
}) => {
  if (!songs.length) return null;
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4 scroll-smooth">
      {songs.map((song, idx) => (
        <div
          key={`${song.id}-${idx}`}
          className="flex-shrink-0 w-36 group cursor-pointer"
          onClick={() => onPlayTrack(song, songs)}
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 mb-2 shadow-lg">
            <img
              src={getBestImage(song) || ''}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="h-8 w-8 text-white fill-current" />
            </div>
            {playingId === song.id && (
              <div className="absolute top-2 left-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <p className="text-[10px] font-bold text-white truncate uppercase italic tracking-tight">{decodeEntities(song.name)}</p>
          <p className="text-[8px] text-neutral-500 truncate uppercase font-black tracking-widest">{song.artists.primary[0]?.name}</p>
        </div>
      ))}
    </div>
  );
};

const SectionLoader = () => (
  <div className="px-6 py-4 space-y-4">
    <div className="h-6 w-44 bg-neutral-900 animate-pulse rounded" />
    <div className="flex gap-4 overflow-hidden">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-36 h-48 bg-neutral-900 animate-pulse rounded-2xl" />
      ))}
    </div>
  </div>
);

export function RecommendedForYou({ onPlayTrack }: { onPlayTrack: (song: Song, list: Song[]) => void }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTrack } = useMusic();

  const load = useCallback(async () => {
    setLoading(true);
    const top = getTopArtists(2).map(t => t.artist);
    try {
      let results: Song[] = [];
      if (top.length > 0) {
        // Search top 1-2 favorite artists.
        const query = top.length === 1 ? `${top[0]} songs` : `${top[0]} ${top[1]}`;
        results = await searchSongs(query, 1);
      }
      if (results.length === 0) {
        // Fallback: trending when no history or empty results.
        results = await getTrending();
      }
      const fresh = filterRecentlyPlayed(results);
      setSongs(deduplicateByAudioUrl(fresh.length ? fresh : results).slice(0, 8));
    } catch (e) {
      console.error('AYUMUSIC: Recommended For You failed', e);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, currentTrack?.id]);

  if (loading) return <SectionLoader />;
  if (!songs.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-6">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">🔥 Recommended For You</h2>
      </div>
      <HorizontalRow songs={songs} onPlayTrack={onPlayTrack} playingId={currentTrack?.id} />
    </section>
  );
}

export function MoreFromArtist({ onPlayTrack }: { onPlayTrack: (song: Song, list: Song[]) => void }) {
  const { currentTrack } = useMusic();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const artistName = currentTrack?.artists?.primary?.[0]?.name;

  const load = useCallback(async () => {
    if (!artistName) {
      setSongs([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchSongs(`${artistName} songs`, 1);
      // Exclude the currently playing song; show 4-6 random ones by the artist.
      const others = results.filter(s => s.id !== currentTrack?.id);
      const fresh = filterRecentlyPlayed(others);
      const pool = deduplicateByAudioUrl(fresh.length ? fresh : others);
      setSongs(shuffle(pool).slice(0, 6));
    } catch (e) {
      console.error('AYUMUSIC: More from artist failed', e);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [artistName, currentTrack?.id]);

  useEffect(() => { void load(); }, [load]);

  if (loading || !songs.length || !artistName) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-6">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">🎧 Because You Listened to {artistName}</h2>
      </div>
      <HorizontalRow songs={songs} onPlayTrack={onPlayTrack} playingId={currentTrack?.id} />
    </section>
  );
}

export function YourWeeklyMix({ onPlayTrack }: { onPlayTrack: (song: Song, list: Song[]) => void }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTrack } = useMusic();

  const load = useCallback(async () => {
    setLoading(true);
    const top = getTopArtists(3).map(t => t.artist);
    try {
      let results: Song[] = [];
      if (top.length > 0) {
        results = await searchSongs(top.join(' '), 1);
      }
      if (results.length === 0) {
        results = await searchSongs('popular hits 2026', 1);
      }
      const fresh = filterRecentlyPlayed(results);
      setSongs(deduplicateByAudioUrl(fresh.length ? fresh : results).slice(0, 12));
    } catch (e) {
      console.error('AYUMUSIC: Your Weekly Mix failed', e);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, currentTrack?.id]);

  if (loading) return <SectionLoader />;
  if (!songs.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-6">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">📅 Your Weekly Mix</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-6 pb-4">
        {songs.map((song, idx) => (
          <div
            key={`${song.id}-${idx}`}
            className="group cursor-pointer"
            onClick={() => onPlayTrack(song, songs)}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 mb-2 shadow-lg">
              <img
                src={getBestImage(song) || ''}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="h-8 w-8 text-white fill-current" />
              </div>
              {currentTrack?.id === song.id && (
                <div className="absolute top-2 left-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <p className="text-[10px] font-bold text-white truncate uppercase italic tracking-tight">{decodeEntities(song.name)}</p>
            <p className="text-[8px] text-neutral-500 truncate uppercase font-black tracking-widest">{song.artists.primary[0]?.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Wrapper exporting all three sections together.
export function HomeRecommendations({ onPlayTrack }: { onPlayTrack: (song: Song, list: Song[]) => void }) {
  return (
    <div className="space-y-10 md:space-y-12 mt-6 md:mt-8">
      <RecommendedForYou onPlayTrack={onPlayTrack} />
      <MoreFromArtist onPlayTrack={onPlayTrack} />
      <YourWeeklyMix onPlayTrack={onPlayTrack} />
    </div>
  );
}
