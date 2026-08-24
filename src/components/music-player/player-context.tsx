
'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getTrending, searchSongs } from '@/lib/music-api';

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
  isPlayerOpen: boolean;
  isLyricsOpen: boolean;
  queue: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  playedHistory: HistoryItem[];
  activeDays: string[];
  exclusionRules: ExclusionRule[];
  smartMood: boolean;
  lyrics: { synced: { time: number; text: string }[]; plain: string } | null;
  loadingLyrics: boolean;
  totalMinutes: number;
  setIsPlayerOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;
  playTrack: (track: Song, fromQueue?: Song[]) => void;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playedHistory, setPlayedHistory] = useState<HistoryItem[]>([]);
  const [activeDays, setActiveDays] = useState<string[]>([]);
  const [exclusionRules, setExclusionRules] = useState<ExclusionRule[]>([]);
  const [smartMood, setSmartMoodState] = useState(false);
  const [songPopularity, setSongPopularity] = useState<Record<string, number>>({});
  const [totalSeconds, setTotalSeconds] = useState(0);
  
  const [lyrics, setLyrics] = useState<{ synced: any[]; plain: string } | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  
  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastProgressUpdateRef = useRef<number>(0);
  const totalSecondsAccumulatorRef = useRef<number>(0);

  useEffect(() => {
    const savedLiked = localStorage.getItem('ayumusics_liked');
    if (savedLiked) setLikedSongs(JSON.parse(savedLiked));

    const savedPlaylists = localStorage.getItem('ayumusics_playlists');
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));

    const savedHistory = localStorage.getItem('ayumusics_history');
    if (savedHistory) setPlayedHistory(JSON.parse(savedHistory));

    const savedDays = localStorage.getItem('ayumusics_activedays');
    if (savedDays) setActiveDays(JSON.parse(savedDays));

    const savedRules = localStorage.getItem('ayumusics_rules');
    if (savedRules) setExclusionRules(JSON.parse(savedRules));

    const savedSmartMood = localStorage.getItem('ayumusics_smartmood');
    if (savedSmartMood) setSmartMoodState(JSON.parse(savedSmartMood));

    const savedPop = localStorage.getItem('ayumusics_popularity');
    if (savedPop) setSongPopularity(JSON.parse(savedPop));

    const savedSeconds = localStorage.getItem('ayumusics_seconds');
    if (savedSeconds) {
      const secs = parseInt(savedSeconds);
      setTotalSeconds(secs);
      totalSecondsAccumulatorRef.current = secs;
    }
  }, []);

  const recordActiveDay = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setActiveDays(prev => {
      if (prev.includes(today)) return prev;
      const next = [...prev, today];
      localStorage.setItem('ayumusics_activedays', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProgress = useCallback(() => {
    if (audioRef.current && isPlaying) {
      const currentTime = audioRef.current.currentTime;
      const now = performance.now();

      if (now - lastProgressUpdateRef.current > 100) {
        setProgress(currentTime);
        lastProgressUpdateRef.current = now;
      }
      
      if (lastTimeRef.current > 0) {
        const diff = currentTime - lastTimeRef.current;
        if (diff > 0 && diff < 2) {
          totalSecondsAccumulatorRef.current += diff;
          
          if (Math.floor(totalSecondsAccumulatorRef.current) > totalSeconds && 
              Math.floor(totalSecondsAccumulatorRef.current) % 10 === 0) {
            const rounded = Math.floor(totalSecondsAccumulatorRef.current);
            setTotalSeconds(rounded);
            localStorage.setItem('ayumusics_seconds', rounded.toString());
            recordActiveDay();
          }
        }
      }
      lastTimeRef.current = currentTime;
      
      frameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying, totalSeconds, recordActiveDay]);

  useEffect(() => {
    if (isPlaying) {
      frameRef.current = requestAnimationFrame(updateProgress);
    } else {
      lastTimeRef.current = 0;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, updateProgress]);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const onLoadedMetadata = () => setDuration(audio.duration);
    
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  const fetchLyrics = async (song: Song) => {
    setLoadingLyrics(true);
    setLyrics(null);
    try {
      const artist = song.artists.primary[0].name;
      const title = song.name;
      const res = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`);
      if (res.ok) {
        const data = await res.json();
        const synced = data.syncedLyrics ? data.syncedLyrics.split('\n').map((line: string) => {
          const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
          if (match) {
            const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
            return { time, text: match[3].trim() };
          }
          return null;
        }).filter(Boolean) : [];
        setLyrics({ synced, plain: data.plainLyrics || "" });
      }
    } catch (e) {
      console.error("Lyrics fetch failed", e);
    } finally {
      setLoadingLyrics(false);
    }
  };

  const playTrack = useCallback((track: Song, fromQueue?: Song[]) => {
    if (fromQueue) setQueue(fromQueue);
    
    recordActiveDay();

    setPlayedHistory(prev => {
      const historyItem: HistoryItem = { id: track.id, name: track.name };
      const next = [historyItem, ...prev.filter(item => item.id !== track.id)].slice(0, 50);
      localStorage.setItem('ayumusics_history', JSON.stringify(next));
      return next;
    });

    setSongPopularity(prev => {
      const next = { ...prev, [track.id]: (prev[track.id] || 0) + 1 };
      localStorage.setItem('ayumusics_popularity', JSON.stringify(next));
      return next;
    });

    const url = getBestDownload(track);
    if (audioRef.current && url) {
      if (currentTrack?.id !== track.id) {
        audioRef.current.src = url;
        setCurrentTrack(track);
        fetchLyrics(track);
      }
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrack, recordActiveDay]);

  const nextTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex(s => s.id === currentTrack.id);
    if (idx !== -1) playTrack(queue[(idx + 1) % queue.length]);
  }, [currentTrack, queue, playTrack]);

  const prevTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex(s => s.id === currentTrack.id);
    if (idx !== -1) playTrack(queue[(idx - 1 + queue.length) % queue.length]);
  }, [currentTrack, queue, playTrack]);

  const handleSmartMoodSync = useCallback(async () => {
    if (!currentTrack || !smartMood) return;
    const vibe = currentTrack.name.split(' ')[0] || currentTrack.artists.primary[0].name;
    const results = await searchSongs(vibe);
    const filtered = results.filter(s => s.id !== currentTrack.id);
    if (filtered.length > 0) {
      playTrack(filtered[Math.floor(Math.random() * filtered.length)]);
    }
  }, [currentTrack, smartMood, playTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => smartMood ? handleSmartMoodSync() : nextTrack();
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [smartMood, handleSmartMoodSync, nextTrack]);

  const playRandomTrack = useCallback(async () => {
    const trending = await getTrending();
    if (trending.length > 0) {
      const randomTrack = trending[Math.floor(Math.random() * trending.length)];
      playTrack(randomTrack, trending);
    }
  }, [playTrack]);

  const stopTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setProgress(time);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  const toggleLike = useCallback((track: Song) => {
    setLikedSongs(prev => {
      const next = prev.find(s => s.id === track.id) ? prev.filter(s => s.id !== track.id) : [track, ...prev];
      localStorage.setItem('ayumusics_liked', JSON.stringify(next));
      return next;
    });
  }, []);

  const isLiked = useCallback((tid: string) => !!likedSongs.find(s => s.id === tid), [likedSongs]);

  const createPlaylist = useCallback((name: string, songs: Song[] = []) => {
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      songs,
      createdAt: Date.now()
    };
    setPlaylists(prev => {
      const next = [...prev, newPlaylist];
      localStorage.setItem('ayumusics_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const addToPlaylist = useCallback((playlistId: string, track: Song) => {
    setPlaylists(prev => {
      const next = prev.map(p => 
        p.id === playlistId 
          ? { ...p, songs: p.songs.find(s => s.id === track.id) ? p.songs : [...p.songs, track] }
          : p
      );
      localStorage.setItem('ayumusics_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => {
      const next = prev.filter(p => p.id !== playlistId);
      localStorage.setItem('ayumusics_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((songId: string) => {
    setPlayedHistory(prev => {
      const next = prev.filter(item => item.id !== songId);
      localStorage.setItem('ayumusics_history', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setPlayedHistory([]);
    localStorage.removeItem('ayumusics_history');
  }, []);

  const addExclusionRule = useCallback((type: 'artist' | 'genre' | 'song', value: string) => {
    const newRule: ExclusionRule = { id: Math.random().toString(36).substr(2, 9), type, value };
    setExclusionRules(prev => {
      const next = [...prev, newRule];
      localStorage.setItem('ayumusics_rules', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeExclusionRule = useCallback((id: string) => {
    setExclusionRules(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem('ayumusics_rules', JSON.stringify(next));
      return next;
    });
  }, []);

  const setSmartMood = useCallback((enabled: boolean) => {
    setSmartMoodState(enabled);
    localStorage.setItem('ayumusics_smartmood', JSON.stringify(enabled));
  }, []);

  const recordSearchSelection = useCallback((song: Song) => {
    setSongPopularity(prev => {
      const next = { ...prev, [song.id]: (prev[song.id] || 0) + 1 };
      localStorage.setItem('ayumusics_popularity', JSON.stringify(next));
      return next;
    });
  }, []);

  const stateValue = useMemo(() => ({
    currentTrack, isPlaying, isPlayerOpen, isLyricsOpen, queue, likedSongs, playlists,
    playedHistory, activeDays, exclusionRules, smartMood,
    lyrics, loadingLyrics, songPopularity, totalMinutes: Math.floor(totalSeconds / 60),
    setIsPlayerOpen, setIsLyricsOpen, playTrack, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, createPlaylist, addToPlaylist, deletePlaylist,
    removeFromHistory, clearHistory, addExclusionRule, removeExclusionRule, setSmartMood, recordSearchSelection
  }), [currentTrack, isPlaying, isPlayerOpen, isLyricsOpen, queue, likedSongs, playlists, playedHistory, activeDays, exclusionRules, smartMood, lyrics, loadingLyrics, songPopularity, totalSeconds, playTrack, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, createPlaylist, addToPlaylist, deletePlaylist, removeFromHistory, clearHistory, addExclusionRule, removeExclusionRule, setSmartMood, recordSearchSelection]);

  const progressValue = useMemo(() => ({
    progress, duration, volume, seek, setVolume
  }), [progress, duration, volume, seek, setVolume]);

  return (
    <MusicStateContext.Provider value={stateValue}>
      <MusicProgressContext.Provider value={progressValue}>
        {children}
      </MusicProgressContext.Provider>
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
