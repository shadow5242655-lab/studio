'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getLyrics, LyricsData } from '@/lib/music-api';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export interface ExclusionRule {
  id: string;
  type: 'artist' | 'song' | 'genre';
  value: string;
}

export interface TasteProfile {
  personaTitle: string;
  description: string;
  dominantMood: string;
  recommendationStyle: string;
}

interface MusicStateContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  isPlayerOpen: boolean;
  isLyricsOpen: boolean;
  queue: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  songPopularity: Record<string, number>;
  playedHistory: string[];
  lyrics: LyricsData | null;
  loadingLyrics: boolean;
  lyricsError: string | null;
  smartMood: boolean;
  exclusionRules: ExclusionRule[];
  tasteProfile: TasteProfile | null;
  setIsPlayerOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;
  playTrack: (track: Song, fromQueue?: Song[]) => void;
  stopTrack: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleLike: (track: Song) => void;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (name: string, initialSongs?: Song[]) => void;
  addToPlaylist: (playlistId: string, track: Song) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  recordSearchSelection: (song: Song) => void;
  removeFromHistory: (songId: string) => void;
  clearHistory: () => void;
  setSmartMood: (enabled: boolean) => void;
  addExclusionRule: (type: ExclusionRule['type'], value: string) => void;
  removeExclusionRule: (id: string) => void;
  setTasteProfile: (profile: TasteProfile | null) => void;
}

interface MusicProgressContextType {
  progress: number;
  duration: number;
  volume: number;
  totalListeningTime: number;
  isSeeking: boolean;
  seek: (time: number) => void;
  commitSeek: (time: number) => void;
  setVolume: (vol: number) => void;
  setIsSeeking: (seeking: boolean) => void;
}

const MusicStateContext = createContext<MusicStateContextType | undefined>(undefined);
const MusicProgressContext = createContext<MusicProgressContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  // --- STATE CONTEXT DATA ---
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerOpenState, setIsPlayerOpenState] = useState(false);
  const [isLyricsOpenState, setIsLyricsOpenState] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songPopularity, setSongPopularity] = useState<Record<string, number>>({});
  const [playedHistory, setPlayedHistory] = useState<string[]>([]);
  const [smartMood, setSmartMood] = useState(true);
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [exclusionRules, setExclusionRules] = useState<ExclusionRule[]>([]);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);

  // --- PROGRESS CONTEXT DATA (High Frequency 60FPS updates) ---
  const [volumeState, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [totalListeningTime, setTotalListeningTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    
    const updateDuration = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    const handleEnded = () => {
      if (queue.length > 0) {
        nextTrack();
      }
    };

    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue]);

  useEffect(() => {
    const updateProgress = (time: number) => {
      if (audioRef.current && isPlaying && !isSeeking) {
        const currentTime = audioRef.current.currentTime;
        setProgress(currentTime);
        
        if (time - lastTimeRef.current > 10000) {
          setTotalListeningTime(prev => prev + 10);
          lastTimeRef.current = time;
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
      setLyricsError(null);
      setLoadingLyrics(true);
      const artist = currentTrack.artists.primary[0]?.name || 'Unknown';
      getLyrics(artist, currentTrack.name)
        .then((data) => {
          setLyrics(data);
          setLoadingLyrics(false);
        })
        .catch(() => {
          setLyricsError('Lyrics not available for this song');
          setLoadingLyrics(false);
        });
    }
  }, [currentTrack]);

  const setIsPlayerOpen = useCallback((open: boolean) => {
    setIsPlayerOpenState(open);
  }, []);

  const setIsLyricsOpen = useCallback((open: boolean) => {
    setIsLyricsOpenState(open);
  }, []);

  const playTrack = useCallback((track: Song, fromQueue?: Song[]) => {
    if (fromQueue) setQueue(fromQueue);
    setPlayedHistory(prev => [track.id, ...prev.filter(id => id !== track.id)].slice(0, 50));
    const url = getBestDownload(track);
    if (audioRef.current && url) {
      if (currentTrack?.id !== track.id) {
        audioRef.current.src = url;
        setCurrentTrack(track);
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
    setIsPlayerOpenState(false);
    setIsLyricsOpenState(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

  const nextTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.id === currentTrack.id);
    if (currentIndex !== -1) {
      const nextIdx = (currentIndex + 1) % queue.length;
      playTrack(queue[nextIdx]);
    }
  }, [currentTrack, queue, playTrack]);

  const prevTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.id === currentTrack.id);
    if (currentIndex !== -1) {
      const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
      playTrack(queue[prevIdx]);
    }
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

  const isLiked = useCallback((trackId: string) => !!likedSongs.find(s => s.id === trackId), [likedSongs]);

  const createPlaylist = useCallback((name: string, initialSongs: Song[] = []) => {
    setPlaylists(prev => [{ id: Math.random().toString(36).substr(2, 9), name, songs: initialSongs, createdAt: Date.now() }, ...prev]);
  }, []);

  const addToPlaylist = useCallback((id: string, track: Song) => {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, songs: p.songs.find(s => s.id === track.id) ? p.songs : [...p.songs, track] } : p));
  }, []);

  const removeFromPlaylist = useCallback((id: string, tid: string) => {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, songs: p.songs.filter(s => s.id !== tid) } : p));
  }, []);

  const deletePlaylist = useCallback((id: string) => setPlaylists(prev => prev.filter(p => p.id !== id)), []);
  
  const recordSearchSelection = useCallback((song: Song) => setSongPopularity(prev => ({ ...prev, [song.id]: (prev[song.id] || 0) + 1 })), []);
  
  const removeFromHistory = useCallback((id: string) => setPlayedHistory(prev => prev.filter(hid => hid !== id)), []);
  
  const clearHistory = useCallback(() => setPlayedHistory([]), []);

  const addExclusionRule = useCallback((type: ExclusionRule['type'], value: string) => {
    setExclusionRules(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type, value }]);
  }, []);

  const removeExclusionRule = useCallback((id: string) => {
    setExclusionRules(prev => prev.filter(r => r.id !== id));
  }, []);

  const stateValue = useMemo(() => ({
    currentTrack, isPlaying, isPlayerOpen: isPlayerOpenState, isLyricsOpen: isLyricsOpenState, queue, likedSongs, playlists, songPopularity, playedHistory,
    lyrics, loadingLyrics, lyricsError, smartMood, exclusionRules, tasteProfile,
    setIsPlayerOpen, setIsLyricsOpen, playTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked,
    createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist, recordSearchSelection, removeFromHistory, clearHistory, setSmartMood,
    addExclusionRule, removeExclusionRule, setTasteProfile
  }), [currentTrack, isPlaying, isPlayerOpenState, isLyricsOpenState, queue, likedSongs, playlists, songPopularity, playedHistory, lyrics, loadingLyrics, lyricsError, smartMood, exclusionRules, tasteProfile, setIsPlayerOpen, setIsLyricsOpen, playTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist, recordSearchSelection, removeFromHistory, clearHistory, setSmartMood, addExclusionRule, removeExclusionRule, setTasteProfile]);

  const progressValue = useMemo(() => ({
    progress, duration, volume: volumeState, totalListeningTime, isSeeking, seek, commitSeek, setVolume, setIsSeeking
  }), [progress, duration, volumeState, totalListeningTime, isSeeking, seek, commitSeek, setVolume, setIsSeeking]);

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