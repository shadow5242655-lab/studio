'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload } from '@/lib/music-api';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export interface UserStats {
  minutesListened: number;
  tracksPlayed: number;
  activeDays: number;
  lastActive: string;
}

interface MusicStateContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  isPlayerOpen: boolean;
  isLyricsOpen: boolean;
  queue: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  userStats: UserStats;
  exclusionRules: any[];
  tasteProfile: any | null;
  lyrics: { synced: { time: number; text: string }[]; plain: string } | null;
  loadingLyrics: boolean;
  setIsPlayerOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;
  playTrack: (track: Song, fromQueue?: Song[]) => void;
  stopTrack: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleLike: (track: Song) => void;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (name: string, songs?: Song[]) => void;
  addToPlaylist: (playlistId: string, track: Song) => void;
  deletePlaylist: (playlistId: string) => void;
  addExclusionRule: (type: string, value: string) => void;
  removeExclusionRule: (id: string) => void;
  setTasteProfile: (profile: any) => void;
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
  const [exclusionRules, setExclusionRules] = useState<any[]>([]);
  const [tasteProfile, setTasteProfileState] = useState<any | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    minutesListened: 0,
    tracksPlayed: 0,
    activeDays: 0,
    lastActive: ''
  });

  const [lyrics, setLyrics] = useState<{ synced: any[]; plain: string } | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  
  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);

  // Load persistence
  useEffect(() => {
    const savedStats = localStorage.getItem('ayumusics_stats');
    if (savedStats) setUserStats(JSON.parse(savedStats));

    const savedLiked = localStorage.getItem('ayumusics_liked');
    if (savedLiked) setLikedSongs(JSON.parse(savedLiked));

    const savedPlaylists = localStorage.getItem('ayumusics_playlists');
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
  }, []);

  // Update Stats persistence
  useEffect(() => {
    localStorage.setItem('ayumusics_stats', JSON.stringify(userStats));
  }, [userStats]);

  // Handle high-frequency progress with requestAnimationFrame
  const updateProgress = useCallback(() => {
    if (audioRef.current && isPlaying) {
      setProgress(audioRef.current.currentTime);
      frameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      frameRef.current = requestAnimationFrame(updateProgress);
    } else if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, updateProgress]);

  // Audio Event Listeners
  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      setUserStats(prev => ({ ...prev, tracksPlayed: prev.tracksPlayed + 1 }));
      nextTrack();
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [queue]);

  // Stats incrementer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setUserStats(prev => ({
          ...prev,
          minutesListened: prev.minutesListened + (1/60),
          lastActive: new Date().toISOString().split('T')[0]
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

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
    const url = getBestDownload(track);
    if (audioRef.current && url) {
      if (currentTrack?.id !== track.id) {
        audioRef.current.src = url;
        setCurrentTrack(track);
        fetchLyrics(track);
        setUserStats(prev => ({ ...prev, tracksPlayed: prev.tracksPlayed + 1 }));
      }
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrack]);

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
      isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

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

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
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
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId 
        ? { ...p, songs: p.songs.find(s => s.id === track.id) ? p.songs : [...p.songs, track] }
        : p
    ));
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  }, []);

  const addExclusionRule = (type: string, value: string) => {
    setExclusionRules(prev => [...prev, { id: Math.random().toString(), type, value }]);
  };

  const removeExclusionRule = (id: string) => {
    setExclusionRules(prev => prev.filter(r => r.id !== id));
  };

  const stateValue = useMemo(() => ({
    currentTrack, isPlaying, isPlayerOpen, isLyricsOpen, queue, likedSongs, playlists, userStats,
    exclusionRules, tasteProfile, lyrics, loadingLyrics,
    setIsPlayerOpen, setIsLyricsOpen, playTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, createPlaylist, addToPlaylist, deletePlaylist,
    addExclusionRule, removeExclusionRule, setTasteProfile: setTasteProfileState
  }), [currentTrack, isPlaying, isPlayerOpen, isLyricsOpen, queue, likedSongs, playlists, userStats, exclusionRules, tasteProfile, lyrics, loadingLyrics, playTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, createPlaylist, addToPlaylist, deletePlaylist]);

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
