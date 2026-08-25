'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getTrending, searchSongs, decodeEntities, analyzeMood, mapMoodToGenre } from '@/lib/music-api';
import { toast } from '@/hooks/use-toast';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  name: string;
}

interface MusicStateContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  isBuffering: boolean;
  isPlayerOpen: boolean;
  isLyricsOpen: boolean;
  queue: Song[];
  autoMixQueue: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  playedHistory: HistoryItem[];
  lyrics: { synced: { time: number; text: string }[]; plain: string } | null;
  loadingLyrics: boolean;
  songPopularity: Record<string, number>;
  smartMood: boolean;
  setSmartMood: (val: boolean) => void;
  setIsPlayerOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;
  playTrack: (track: Song, fromQueue?: Song[]) => void;
  playNext: (track: Song) => void;
  addToQueue: (track: Song) => void;
  playRandomTrack: () => Promise<void>;
  stopTrack: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleLike: (track: Song) => void;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (name: string, songs?: Song[]) => void;
  addToPlaylist: (playlistId: string, track: Song) => void;
  deletePlaylist: (id: string) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

interface MusicProgressContextType {
  progress: number;
  duration: number;
  volume: number;
  totalMinutes: number;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
}

const MusicStateContext = createContext<MusicStateContextType | undefined>(undefined);
const MusicProgressContext = createContext<MusicProgressContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const currentTrackRef = useRef<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const queueRef = useRef<Song[]>([]);
  const [autoMixQueue, setAutoMixQueue] = useState<Song[]>([]);
  const autoMixQueueRef = useRef<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playedHistory, setPlayedHistory] = useState<HistoryItem[]>([]);
  const [songPopularity, setSongPopularity] = useState<Record<string, number>>({});
  const [lyrics, setLyrics] = useState<{ synced: any[]; plain: string } | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const volumeRef = useRef(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [smartMood, setSmartMood] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const secondaryAudioRef = useRef<HTMLAudioElement | null>(null);
  const isCrossfadingRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  // Stable Logic Ref pattern to prevent control-lock during automatic transitions
  const stableLogicRef = useRef<{
    playTrack: (track: Song, fromQueue?: Song[]) => void;
    nextTrack: () => void;
    playRandomTrack: () => Promise<void>;
    fetchLyrics: (song: Song) => Promise<void>;
  } | null>(null);

  const stopTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (secondaryAudioRef.current) {
      secondaryAudioRef.current.pause();
      secondaryAudioRef.current.src = "";
    }
    isCrossfadingRef.current = false;
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, []);

  const triggerMoodMix = useCallback(async (song: Song, lyricData: string) => {
    if (!smartMood || !lyricData || lyricData === "No lyrics found") return;
    try {
      const emotion = await analyzeMood(lyricData);
      const genre = mapMoodToGenre(emotion);
      const results = await searchSongs(genre);
      const freshMix = results.filter(s => s.id !== song.id).slice(0, 15);
      setAutoMixQueue(freshMix);
      autoMixQueueRef.current = freshMix;
    } catch (e) {
      const fallback = await getTrending();
      const randMix = fallback.sort(() => 0.5 - Math.random()).slice(0, 10);
      setAutoMixQueue(randMix);
      autoMixQueueRef.current = randMix;
    }
  }, [smartMood]);

  const fetchLyrics = useCallback(async (song: Song) => {
    const targetId = song.id;
    setLoadingLyrics(true);
    setLyrics(null);
    try {
      const clean = (s: string) => decodeEntities(s)
        .replace(/\(.*\)|\[.*\]|feat\..*|&.*?;|official video|music video|lyrical|audio/gi, '')
        .trim();
      
      const title = clean(song.name);
      const artist = song.artists.primary[0]?.name ? clean(song.artists.primary[0].name) : '';
      
      const res = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`);
      if (res.ok) {
        const data = await res.json();
        if (currentTrackRef.current?.id === targetId) {
          const synced = data.syncedLyrics ? data.syncedLyrics.split('\n').map((l: string) => {
            const m = l.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
            return m ? { time: parseInt(m[1]) * 60 + parseFloat(m[2]), text: m[3].trim() } : null;
          }).filter(Boolean) : [];
          const plain = data.plainLyrics || "";
          setLyrics({ synced, plain });
          triggerMoodMix(song, plain);
        }
      } else {
        triggerMoodMix(song, "No lyrics found");
      }
    } catch (e) {
      triggerMoodMix(song, "Error");
    } finally {
      if (currentTrackRef.current?.id === targetId) setLoadingLyrics(false);
    }
  }, [triggerMoodMix]);

  const playTrack = useCallback((track: Song, fromQueue?: Song[]) => {
    stopTrack();
    if (fromQueue) {
      setQueue(fromQueue);
      queueRef.current = fromQueue;
    }
    
    // UI state reset immediately
    setProgress(0);
    setDuration(track.duration || 0);
    
    setPlayedHistory(prev => [{ id: track.id, name: track.name }, ...prev.filter(i => i.id !== track.id)].slice(0, 50));
    const url = getBestDownload(track);
    if (audioRef.current && url) {
      audioRef.current.src = url;
      audioRef.current.volume = volumeRef.current;
      setCurrentTrack(track);
      currentTrackRef.current = track;
      fetchLyrics(track);
      audioRef.current.play().catch(() => {});
      localStorage.setItem('ayumusics_last_track', JSON.stringify(track));
    }
  }, [fetchLyrics, stopTrack]);

  const playRandomTrack = useCallback(async () => {
    const trending = await getTrending();
    if (trending.length > 0) {
      const rand = trending[Math.floor(Math.random() * trending.length)];
      playTrack(rand, trending);
    }
  }, [playTrack]);

  const nextTrack = useCallback(() => {
    if (smartMood && autoMixQueueRef.current.length > 0) {
      const next = autoMixQueueRef.current[0];
      const remaining = autoMixQueueRef.current.slice(1);
      setAutoMixQueue(remaining);
      autoMixQueueRef.current = remaining;
      playTrack(next);
      return;
    }

    if (queueRef.current.length === 0) {
      playRandomTrack();
      return;
    }
    const idx = queueRef.current.findIndex(s => s.id === currentTrackRef.current?.id);
    if (idx !== -1 && idx < queueRef.current.length - 1) {
      playTrack(queueRef.current[idx + 1]);
    } else {
      playRandomTrack();
    }
  }, [playTrack, playRandomTrack, smartMood]);

  const prevTrack = useCallback(() => {
    if (queueRef.current.length === 0) return;
    const idx = queueRef.current.findIndex(s => s.id === currentTrackRef.current?.id);
    if (idx !== -1 && idx > 0) {
      playTrack(queueRef.current[idx - 1]);
    }
  }, [playTrack]);

  // Update stable logic ref
  useEffect(() => {
    stableLogicRef.current = { playTrack, nextTrack, playRandomTrack, fetchLyrics };
  }, [playTrack, nextTrack, playRandomTrack, fetchLyrics]);

  const playNext = useCallback((track: Song) => {
    setQueue(prev => {
      const next = [...prev.filter(s => s.id !== track.id)];
      const idx = next.findIndex(s => s.id === currentTrackRef.current?.id);
      next.splice(idx + 1, 0, track);
      queueRef.current = next;
      return next;
    });
    toast({ title: 'Ordered', description: `"${decodeEntities(track.name)}" is next.` });
  }, []);

  const addToQueue = useCallback((track: Song) => {
    setQueue(prev => {
      const next = prev.find(s => s.id === track.id) ? prev : [...prev, track];
      queueRef.current = next;
      return next;
    });
    toast({ title: 'Buffered', description: `"${decodeEntities(track.name)}" added to queue.` });
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlayingRef.current) audioRef.current.pause();
      else audioRef.current.play().catch(() => {});
    }
  }, []);

  const toggleLike = useCallback((track: Song) => {
    setLikedSongs(prev => {
      const exists = prev.find(s => s.id === track.id);
      if (exists) return prev.filter(s => s.id !== track.id);
      return [...prev, track];
    });
  }, []);

  const createPlaylist = useCallback((name: string, songs: Song[] = []) => {
    setPlaylists(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name, songs, createdAt: Date.now() }]);
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  }, []);

  const addToPlaylist = useCallback((playlistId: string, track: Song) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, songs: [...p.songs.filter(s => s.id !== track.id), track] } : p));
    toast({ title: 'Collection Updated', description: `Track added to your playlist.` });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setPlayedHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setPlayedHistory([]);
  }, []);

  const updateProgress = useCallback(() => {
    if (audioRef.current && isPlayingRef.current) {
      const time = audioRef.current.currentTime;
      const now = performance.now();
      
      // Throttled UI update
      if (! (window as any).lastProgUpdate || now - (window as any).lastProgUpdate > 250) {
        setProgress(time);
        (window as any).lastProgUpdate = now;
      }
      
      // Throttled persistence
      if (! (window as any).lastTimerUpdate || now - (window as any).lastTimerUpdate > 5000) {
         setTotalSeconds(prev => prev + 5);
         (window as any).lastTimerUpdate = now;
         localStorage.setItem('ayumusics_last_pos', time.toString());
      }
      frameRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as any).lastProgUpdate = 0;
    (window as any).lastTimerUpdate = 0;
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const hs = {
      loadedmetadata: () => setDuration(audio.duration),
      durationchange: () => setDuration(audio.duration),
      ended: () => { stableLogicRef.current?.nextTrack(); },
      play: () => { setIsPlaying(true); isPlayingRef.current = true; },
      pause: () => { setIsPlaying(false); isPlayingRef.current = false; },
      waiting: () => setIsBuffering(true),
      playing: () => setIsBuffering(false)
    };
    Object.entries(hs).forEach(([e, f]) => audio.addEventListener(e, f));
    
    // Load last track
    const saved = localStorage.getItem('ayumusics_last_track');
    const pos = localStorage.getItem('ayumusics_last_pos');
    if (saved) {
      try {
        const track = JSON.parse(saved);
        setCurrentTrack(track);
        currentTrackRef.current = track;
        audio.src = getBestDownload(track);
        if (pos) audio.currentTime = parseFloat(pos);
        stableLogicRef.current?.fetchLyrics(track);
      } catch (e) {}
    }
    
    return () => Object.entries(hs).forEach(([e, f]) => audio.removeEventListener(e, f));
  }, []);

  useEffect(() => {
    if (isPlaying) frameRef.current = requestAnimationFrame(updateProgress);
    else if (frameRef.current) cancelAnimationFrame(frameRef.current);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [isPlaying, updateProgress]);

  const stateVal = useMemo(() => ({
    currentTrack, isPlaying, isBuffering, isPlayerOpen, isLyricsOpen, queue, autoMixQueue, likedSongs, playlists,
    playedHistory, lyrics, loadingLyrics, songPopularity, smartMood, setSmartMood,
    setIsPlayerOpen, setIsLyricsOpen, playTrack, playNext, addToQueue, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, 
    isLiked: (id: string) => !!likedSongs.find(s => s.id === id), createPlaylist, addToPlaylist, deletePlaylist, removeFromHistory, clearHistory
  }), [currentTrack, isPlaying, isBuffering, isPlayerOpen, isLyricsOpen, queue, autoMixQueue, likedSongs, playlists, playedHistory, lyrics, loadingLyrics, songPopularity, smartMood, playTrack, playNext, addToQueue, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, createPlaylist, addToPlaylist, deletePlaylist, removeFromHistory, clearHistory]);

  const progVal = useMemo(() => ({ 
    progress, duration, volume, totalMinutes: Math.floor(totalSeconds / 60),
    seek: (t: number) => { if (audioRef.current) audioRef.current.currentTime = t; setProgress(t); }, 
    setVolume: (v: number) => { setVolumeState(v); volumeRef.current = v; if (audioRef.current) audioRef.current.volume = v; } 
  }), [progress, duration, volume, totalSeconds]);

  return (
    <MusicStateContext.Provider value={stateVal}>
      <MusicProgressContext.Provider value={progVal}>{children}</MusicProgressContext.Provider>
    </MusicStateContext.Provider>
  );
}

export const useMusic = () => {
  const c = useContext(MusicStateContext);
  if (!c) throw new Error('useMusic fail');
  return c;
};

export const useMusicProgress = () => {
  const c = useContext(MusicProgressContext);
  if (!c) throw new Error('useMusicProgress fail');
  return c;
};
