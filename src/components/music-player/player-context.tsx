'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getLyrics, LyricsData } from '@/lib/music-api';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export interface UserStats {
  totalMinutes: number;
  totalTracks: number;
  activeDays: string[];
}

export interface TasteProfile {
  topArtists: string[];
  topGenres: string[];
}

interface MusicStateContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  isPlayerOpen: boolean;
  isLyricsOpen: boolean;
  queue: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  playedHistory: string[];
  lyrics: LyricsData | null;
  loadingLyrics: boolean;
  userStats: UserStats;
  artistFilter: string | null;
  setIsPlayerOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;
  playTrack: (track: Song, fromQueue?: Song[]) => void;
  stopTrack: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleLike: (track: Song) => void;
  isLiked: (trackId: string) => boolean;
  setArtistFilter: (artist: string | null) => void;
}

interface MusicProgressContextType {
  progress: number;
  duration: number;
  volume: number;
  isSeeking: boolean;
  seek: (time: number) => void;
  commitSeek: (time: number) => void;
  setVolume: (vol: number) => void;
  setIsSeeking: (seeking: boolean) => void;
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
  const [playedHistory, setPlayedHistory] = useState<string[]>([]);
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [artistFilter, setArtistFilter] = useState<string | null>(null);
  
  // User Stats State
  const [userStats, setUserStats] = useState<UserStats>({ totalMinutes: 0, totalTracks: 0, activeDays: [] });

  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastSecondRef = useRef<number>(0);

  // Persistence: User Stats & History
  useEffect(() => {
    const savedStats = localStorage.getItem('ayumusics_stats');
    if (savedStats) setUserStats(JSON.parse(savedStats));

    const today = new Date().toDateString();
    setUserStats(prev => {
      const days = prev.activeDays.includes(today) ? prev.activeDays : [...prev.activeDays, today];
      return { ...prev, activeDays: days };
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('ayumusics_stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setUserStats(prev => ({ ...prev, totalTracks: prev.totalTracks + 1 }));
      nextTrack();
    };

    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [queue]);

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && isPlaying && !isSeeking) {
        const cur = audioRef.current.currentTime;
        setProgress(cur);
        
        // Update listening minutes every 60 seconds of playback
        if (Math.floor(cur) !== lastSecondRef.current) {
          lastSecondRef.current = Math.floor(cur);
          if (lastSecondRef.current % 60 === 0 && lastSecondRef.current > 0) {
            setUserStats(prev => ({ ...prev, totalMinutes: prev.totalMinutes + 1 }));
          }
        }
        rafRef.current = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying && !isSeeking) {
      rafRef.current = requestAnimationFrame(updateProgress);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, isSeeking]);

  useEffect(() => {
    if (currentTrack) {
      setLyrics(null);
      setLoadingLyrics(true);
      const artist = currentTrack.artists.primary[0]?.name || 'Unknown';
      getLyrics(artist, currentTrack.name)
        .then(setLyrics)
        .finally(() => setLoadingLyrics(false));
    }
  }, [currentTrack]);

  const playTrack = useCallback((track: Song, fromQueue?: Song[]) => {
    if (fromQueue) setQueue(fromQueue);
    const url = getBestDownload(track);
    if (audioRef.current && url) {
      if (currentTrack?.id !== track.id) {
        audioRef.current.src = url;
        setCurrentTrack(track);
        lastSecondRef.current = 0;
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

  const seek = useCallback((time: number) => setProgress(time), []);

  const commitSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
      setIsSeeking(false);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  const toggleLike = useCallback((track: Song) => {
    setLikedSongs(prev => prev.find(s => s.id === track.id) ? prev.filter(s => s.id !== track.id) : [track, ...prev]);
  }, []);

  const isLiked = useCallback((tid: string) => !!likedSongs.find(s => s.id === tid), [likedSongs]);

  const stateValue = useMemo(() => ({
    currentTrack, isPlaying, isPlayerOpen, isLyricsOpen, queue, likedSongs, playlists, playedHistory, lyrics, loadingLyrics, userStats, artistFilter,
    setIsPlayerOpen, setIsLyricsOpen, playTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, setArtistFilter
  }), [currentTrack, isPlaying, isPlayerOpen, isLyricsOpen, queue, likedSongs, playlists, playedHistory, lyrics, loadingLyrics, userStats, artistFilter, playTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked]);

  const progressValue = useMemo(() => ({
    progress, duration, volume, isSeeking, seek, commitSeek, setVolume, setIsSeeking
  }), [progress, duration, volume, isSeeking, seek, commitSeek, setVolume, setIsSeeking]);

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
