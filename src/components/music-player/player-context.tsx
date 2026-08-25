'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getTrending, searchSongs, applySmartRank3 } from '@/lib/music-api';
import { toast } from '@/hooks/use-toast';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export interface ExclusionRule {
  id: string;
  type: 'artist' | 'genre' | 'song';
  value: string;
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
  likedSongs: Song[];
  playlists: Playlist[];
  playedHistory: HistoryItem[];
  activeDays: string[];
  exclusionRules: ExclusionRule[];
  smartMood: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';
  lyrics: { synced: { time: number; text: string }[]; plain: string } | null;
  loadingLyrics: boolean;
  totalMinutes: number;
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
  deletePlaylist: (playlistId: string) => void;
  removeFromHistory: (songId: string) => void;
  clearHistory: () => void;
  addExclusionRule: (type: 'artist' | 'genre' | 'song', value: string) => void;
  removeExclusionRule: (id: string) => void;
  setSmartMood: (enabled: boolean) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  songPopularity: Record<string, number>;
  recordSearchSelection: (song: Song) => void;
}

interface MusicProgressContextType {
  progress: number;
  duration: number;
  volume: number;
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
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playedHistory, setPlayedHistory] = useState<HistoryItem[]>([]);
  const [activeDays, setActiveDays] = useState<string[]>([]);
  const [exclusionRules, setExclusionRules] = useState<ExclusionRule[]>([]);
  const [smartMood, setSmartMoodState] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const repeatModeRef = useRef(repeatMode);
  const [songPopularity, setSongPopularity] = useState<Record<string, number>>({});
  const [totalSeconds, setTotalSeconds] = useState(0);
  const totalSecondsRef = useRef(0);
  const [lyrics, setLyrics] = useState<{ synced: any[]; plain: string } | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const volumeRef = useRef(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const secondaryAudioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastProgressUpdateRef = useRef<number>(0);
  const totalSecondsAccumulatorRef = useRef<number>(0);
  const isCrossfadingRef = useRef(false);

  // Core Function Definitions (Hoisted for effect safety)
  const stopTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
    if (secondaryAudioRef.current) {
      secondaryAudioRef.current.pause();
      secondaryAudioRef.current.src = "";
      secondaryAudioRef.current.load();
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    isCrossfadingRef.current = false;
  }, []);

  const recordActiveDay = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setActiveDays(prev => {
      if (prev.includes(today)) return prev;
      const next = [...prev, today];
      if (typeof window !== 'undefined') localStorage.setItem('ayumusics_activedays', JSON.stringify(next));
      return next;
    });
  }, []);

  const fetchLyrics = useCallback(async (song: Song) => {
    const targetId = song.id;
    setLoadingLyrics(true);
    setLyrics(null);
    try {
      // Aggressive cleaning for high-fidelity lyrics matching
      const cleanTitle = song.name
        .replace(/\(Official Video\)/gi, '')
        .replace(/\(Official Audio\)/gi, '')
        .replace(/\(Lyrical\)/gi, '')
        .replace(/\(Live\)/gi, '')
        .replace(/\[.*\]/g, '')
        .replace(/\(.*\)/g, '')
        .split('-')[0].trim();
        
      const cleanArtist = song.artists.primary[0]?.name.replace(/\(.*\)/g, '').trim() || '';
      
      const res = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`);
      
      if (currentTrackRef.current?.id !== targetId) return;
      
      if (res.ok) {
        const data = await res.json();
        const synced = data.syncedLyrics ? data.syncedLyrics.split('\n').map((line: string) => {
          const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
          if (match) {
            const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
            return { time, text: match[3].trim() };
          }
          return null;
        }).filter(Boolean) : [];
        setLyrics({ synced, plain: data.plainLyrics || "" });
      }
    } catch (e) {
      console.warn("Lyrics resonance lookup failed", e);
    } finally {
      if (currentTrackRef.current?.id === targetId) setLoadingLyrics(false);
    }
  }, []);

  const playTrack = useCallback((track: Song, fromQueue?: Song[]) => {
    // Definitive Audio Reset (Fixes 2 songs playing at once)
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
    if (secondaryAudioRef.current) {
      secondaryAudioRef.current.pause();
      secondaryAudioRef.current.src = "";
      secondaryAudioRef.current.load();
    }
    isCrossfadingRef.current = false;

    if (fromQueue) {
      setQueue(fromQueue);
      queueRef.current = fromQueue;
    }
    
    recordActiveDay();
    setPlayedHistory(prev => {
      const historyItem: HistoryItem = { id: track.id, name: track.name };
      const next = [historyItem, ...prev.filter(item => item.id !== track.id)].slice(0, 50);
      if (typeof window !== 'undefined') localStorage.setItem('ayumusics_history', JSON.stringify(next));
      return next;
    });

    const url = getBestDownload(track);
    if (audioRef.current && url) {
      if (typeof window !== 'undefined') localStorage.setItem('ayumusics_last_track', JSON.stringify(track));
      audioRef.current.src = url;
      audioRef.current.volume = volumeRef.current;
      setCurrentTrack(track);
      fetchLyrics(track);
      audioRef.current.play().catch(() => {});
    }
  }, [recordActiveDay, fetchLyrics]);

  const playRandomTrack = useCallback(async () => {
    const trending = await getTrending();
    if (trending.length > 0) {
      const randomTrack = trending[Math.floor(Math.random() * trending.length)];
      playTrack(randomTrack, trending);
    }
  }, [playTrack]);

  const handleInfiniteDiscovery = useCallback(async (baseTrack: Song) => {
    const artistName = baseTrack.artists.primary[0]?.name || "Latest Trending";
    try {
      const results = await searchSongs(artistName);
      const filtered = results.filter(s => s.id !== baseTrack.id);
      if (filtered.length > 0) playTrack(filtered[0], filtered);
      else await playRandomTrack();
    } catch (e) {
      await playRandomTrack();
    }
  }, [playTrack, playRandomTrack]);

  const nextTrack = useCallback(() => {
    const track = currentTrackRef.current;
    if (!track) return playRandomTrack();
    
    if (repeatModeRef.current === 'one') {
      if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); }
      return;
    }

    const idx = queueRef.current.findIndex(s => s.id === track.id);
    if (idx !== -1 && idx < queueRef.current.length - 1) {
      playTrack(queueRef.current[idx + 1]);
    } else if (repeatModeRef.current === 'all' && queueRef.current.length > 0) {
      playTrack(queueRef.current[0]);
    } else {
      handleInfiniteDiscovery(track);
    }
  }, [playTrack, handleInfiniteDiscovery, playRandomTrack]);

  const prevTrack = useCallback(() => {
    const track = currentTrackRef.current;
    if (!track || queueRef.current.length === 0) return;
    const idx = queueRef.current.findIndex(s => s.id === track.id);
    if (idx !== -1 && idx > 0) playTrack(queueRef.current[idx - 1]);
    else playTrack(queueRef.current[queueRef.current.length - 1]);
  }, [playTrack]);

  const playNext = useCallback((track: Song) => {
    setQueue(prev => {
      const idx = prev.findIndex(s => s.id === (currentTrackRef.current?.id || ''));
      const nextQueue = [...prev.filter(s => s.id !== track.id)];
      if (idx !== -1) nextQueue.splice(idx + 1, 0, track);
      else nextQueue.unshift(track);
      return nextQueue;
    });
    toast({ title: 'Resonance Ordered', description: `"${track.name}" will play next.` });
  }, []);

  const addToQueue = useCallback((track: Song) => {
    setQueue(prev => prev.find(s => s.id === track.id) ? prev : [...prev, track]);
    toast({ title: 'Frequency Buffered', description: `"${track.name}" added to queue.` });
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlayingRef.current) audioRef.current.pause();
      else audioRef.current.play().catch(() => {});
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
    if (secondaryAudioRef.current) secondaryAudioRef.current.volume = vol;
  }, []);

  const toggleLike = useCallback((track: Song) => {
    setLikedSongs(prev => {
      const next = prev.find(s => s.id === track.id) ? prev.filter(s => s.id !== track.id) : [track, ...prev];
      if (typeof window !== 'undefined') localStorage.setItem('ayumusics_liked', JSON.stringify(next));
      return next;
    });
  }, []);

  const isLiked = useCallback((tid: string) => !!likedSongs.find(s => s.id === tid), [likedSongs]);

  const createPlaylist = useCallback((name: string, songs: Song[] = []) => {
    const newPlaylist: Playlist = { id: Math.random().toString(36).substr(2, 9), name, songs, createdAt: Date.now() };
    setPlaylists(prev => {
      const next = [...prev, newPlaylist];
      if (typeof window !== 'undefined') localStorage.setItem('ayumusics_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const addToPlaylist = useCallback((playlistId: string, track: Song) => {
    setPlaylists(prev => {
      const next = prev.map(p => p.id === playlistId ? { ...p, songs: p.songs.find(s => s.id === track.id) ? p.songs : [...p.songs, track] } : p);
      if (typeof window !== 'undefined') localStorage.setItem('ayumusics_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => {
      const next = prev.filter(p => p.id !== playlistId);
      if (typeof window !== 'undefined') localStorage.setItem('ayumusics_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((songId: string) => {
    setPlayedHistory(prev => {
      const next = prev.filter(item => item.id !== songId);
      if (typeof window !== 'undefined') localStorage.setItem('ayumusics_history', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setPlayedHistory([]);
    if (typeof window !== 'undefined') localStorage.removeItem('ayumusics_history');
  }, []);

  const addExclusionRule = useCallback((type: 'artist' | 'genre' | 'song', value: string) => {
    const newRule: ExclusionRule = { id: Math.random().toString(36).substr(2, 9), type, value };
    setExclusionRules(prev => {
      const next = [...prev, newRule];
      if (typeof window !== 'undefined') localStorage.setItem('ayumusics_rules', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeExclusionRule = useCallback((id: string) => {
    setExclusionRules(prev => {
      const next = prev.filter(r => r.id !== id);
      if (typeof window !== 'undefined') localStorage.setItem('ayumusics_rules', JSON.stringify(next));
      return next;
    });
  }, []);

  const setSmartMood = useCallback((enabled: boolean) => {
    setSmartMoodState(enabled);
    if (typeof window !== 'undefined') localStorage.setItem('ayumusics_smartmood', JSON.stringify(enabled));
  }, []);

  const toggleShuffle = useCallback(() => setIsShuffle(prev => !prev), []);
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const recordSearchSelection = useCallback((song: Song) => {
    setSongPopularity(prev => {
      const next = { ...prev, [song.id]: (prev[song.id] || 0) + 1 };
      if (typeof window !== 'undefined') localStorage.setItem('ayumusics_popularity', JSON.stringify(next));
      return next;
    });
  }, []);

  const performCrossfade = useCallback((nextSong: Song) => {
    if (!audioRef.current || !secondaryAudioRef.current || isCrossfadingRef.current) return;
    isCrossfadingRef.current = true;
    const nextUrl = getBestDownload(nextSong);
    const primary = audioRef.current;
    const secondary = secondaryAudioRef.current;
    
    secondary.src = nextUrl;
    secondary.volume = 0;
    secondary.play().then(() => {
      let step = 0;
      const steps = 60; // ~3 seconds at 50ms interval
      const currentVol = volumeRef.current;
      const fade = setInterval(() => {
        step++;
        const ratio = step / steps;
        primary.volume = Math.max(0, currentVol * (1 - ratio));
        secondary.volume = Math.min(currentVol, currentVol * ratio);
        if (step >= steps) {
          clearInterval(fade);
          primary.pause();
          primary.src = secondary.src;
          primary.currentTime = secondary.currentTime;
          primary.volume = currentVol;
          setCurrentTrack(nextSong);
          fetchLyrics(nextSong);
          isCrossfadingRef.current = false;
        }
      }, 50);
    }).catch(() => { 
      isCrossfadingRef.current = false; 
      playTrack(nextSong); 
    });
  }, [playTrack, fetchLyrics]);

  const updateProgress = useCallback(() => {
    if (audioRef.current && isPlayingRef.current) {
      const currentTime = audioRef.current.currentTime;
      const timeLeft = audioRef.current.duration - currentTime;
      const now = performance.now();
      
      // Hardware-accelerated throttling to prevent re-render depth errors
      if (now - lastProgressUpdateRef.current > 250) {
        setProgress(currentTime);
        if (typeof window !== 'undefined') localStorage.setItem('ayumusics_last_pos', currentTime.toString());
        lastProgressUpdateRef.current = now;
      }
      
      // Initiate crossfade 3 seconds before end
      if (timeLeft < 3 && !isCrossfadingRef.current && repeatModeRef.current !== 'one') {
         const idx = queueRef.current.findIndex(s => s.id === (currentTrackRef.current?.id || ''));
         if (idx !== -1 && idx < queueRef.current.length - 1) performCrossfade(queueRef.current[idx + 1]);
      }
      
      // Update listening time (Throttled state update)
      if (lastTimeRef.current > 0) {
        const diff = currentTime - lastTimeRef.current;
        if (diff > 0 && diff < 2) {
          totalSecondsAccumulatorRef.current += diff;
          const currentTotal = Math.floor(totalSecondsAccumulatorRef.current);
          // Only update state once every 10 seconds to avoid depth errors
          if (currentTotal !== totalSecondsRef.current && currentTotal % 10 === 0) {
            totalSecondsRef.current = currentTotal;
            setTotalSeconds(currentTotal);
            if (typeof window !== 'undefined') localStorage.setItem('ayumusics_seconds', currentTotal.toString());
          }
        }
      }
      lastTimeRef.current = currentTime;
      frameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [performCrossfade]);

  // Effects
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    audioRef.current = new Audio();
    secondaryAudioRef.current = new Audio();

    const loadSaved = (key: string) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
    setLikedSongs(loadSaved('ayumusics_liked') || []);
    setPlaylists(loadSaved('ayumusics_playlists') || []);
    setPlayedHistory(loadSaved('ayumusics_history') || []);
    setActiveDays(loadSaved('ayumusics_activedays') || []);
    setExclusionRules(loadSaved('ayumusics_rules') || []);
    setSmartMoodState(loadSaved('ayumusics_smartmood') ?? true);
    setSongPopularity(loadSaved('ayumusics_popularity') || {});
    
    const s = parseInt(localStorage.getItem('ayumusics_seconds') || '0');
    setTotalSeconds(s); 
    totalSecondsRef.current = s;
    totalSecondsAccumulatorRef.current = s;
    
    const lastTrack = loadSaved('ayumusics_last_track');
    const lastPos = parseFloat(localStorage.getItem('ayumusics_last_pos') || '0');
    if (lastTrack && audioRef.current) {
      setCurrentTrack(lastTrack); 
      audioRef.current.src = getBestDownload(lastTrack);
      audioRef.current.currentTime = lastPos; 
      setProgress(lastPos); 
      fetchLyrics(lastTrack);
    }

    const audio = audioRef.current;
    const handlers = {
      loadedmetadata: () => setDuration(audio.duration),
      ended: () => !isCrossfadingRef.current && nextTrack(),
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      waiting: () => setIsBuffering(true),
      playing: () => setIsBuffering(false),
      canplay: () => setIsBuffering(false)
    };
    Object.entries(handlers).forEach(([ev, fn]) => audio.addEventListener(ev, fn));
    return () => Object.entries(handlers).forEach(([ev, fn]) => audio.removeEventListener(ev, fn));
  }, [nextTrack, fetchLyrics]);

  useEffect(() => {
    if (isPlaying) frameRef.current = requestAnimationFrame(updateProgress);
    else { lastTimeRef.current = 0; if (frameRef.current) cancelAnimationFrame(frameRef.current); }
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [isPlaying, updateProgress]);

  const stateValue = useMemo(() => ({
    currentTrack, isPlaying, isBuffering, isPlayerOpen, isLyricsOpen, queue, likedSongs, playlists,
    playedHistory, activeDays, exclusionRules, smartMood, isShuffle, repeatMode,
    lyrics, loadingLyrics, songPopularity, totalMinutes: Math.floor(totalSeconds / 60),
    setIsPlayerOpen, setIsLyricsOpen, playTrack, playNext, addToQueue, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, createPlaylist, addToPlaylist, deletePlaylist,
    removeFromHistory, clearHistory, addExclusionRule, removeExclusionRule, setSmartMood, toggleShuffle, toggleRepeat, recordSearchSelection
  }), [currentTrack, isPlaying, isBuffering, isPlayerOpen, isLyricsOpen, queue, likedSongs, playlists, playedHistory, activeDays, exclusionRules, smartMood, isShuffle, repeatMode, lyrics, loadingLyrics, songPopularity, totalSeconds, playTrack, playNext, addToQueue, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, createPlaylist, addToPlaylist, deletePlaylist, removeFromHistory, clearHistory, addExclusionRule, removeExclusionRule, setSmartMood, toggleShuffle, toggleRepeat, recordSearchSelection]);

  const progressValue = useMemo(() => ({ progress, duration, volume, seek, setVolume }), [progress, duration, volume, seek, setVolume]);

  return (
    <MusicStateContext.Provider value={stateValue}>
      <MusicProgressContext.Provider value={progressValue}>{children}</MusicProgressContext.Provider>
    </MusicStateContext.Provider>
  );
}

export const useMusic = () => {
  const context = useContext(MusicStateContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
};

export const useMusicProgress = () => {
  const context = useContext(MusicProgressContext);
  if (!context) throw new Error('useMusicProgress must be used within MusicProvider');
  return context;
};