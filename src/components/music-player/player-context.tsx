
'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getLyrics, LyricsData } from '@/lib/music-api';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
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
  // State Context Data
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerOpenInternal, setIsPlayerOpenInternal] = useState(false);
  const [isLyricsOpenInternal, setIsLyricsOpenInternal] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songPopularity, setSongPopularity] = useState<Record<string, number>>({});
  const [playedHistory, setPlayedHistory] = useState<string[]>([]);
  const [smartMood, setSmartMood] = useState(true);
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  // Progress Context Data (High Frequency)
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
    const handleEnded = () => nextTrack();

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
  }, []);

  // 60FPS Loop for progress updates - Prevents lag by staying in the animation frame
  useEffect(() => {
    const updateProgress = (time: number) => {
      if (audioRef.current && isPlaying && !isSeeking) {
        const currentTime = audioRef.current.currentTime;
        setProgress(currentTime);
        
        // Track listening time in 10s intervals
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

  // Sync Lyrics Logic
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
    setIsPlayerOpenInternal(open);
  }, []);

  const setIsLyricsOpen = useCallback((open: boolean) => {
    setIsLyricsOpenInternal(open);
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
    setIsPlayerOpenInternal(false);
    setIsLyricsOpenInternal(false);
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
      playTrack(queue[(currentIndex + 1) % queue.length]);
    }
  }, [currentTrack, queue, playTrack]);

  const prevTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.id === currentTrack.id);
    if (currentIndex !== -1) {
      playTrack(queue[(currentIndex - 1 + queue.length) % queue.length]);
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

  const stateValue = useMemo(() => ({
    currentTrack, isPlaying, isPlayerOpen: isPlayerOpenInternal, isLyricsOpen: isLyricsOpenInternal, queue, likedSongs, playlists, songPopularity, playedHistory,
    lyrics, loadingLyrics, lyricsError, smartMood,
    setIsPlayerOpen, setIsLyricsOpen, playTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked,
    createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist, recordSearchSelection, removeFromHistory, clearHistory, setSmartMood
  }), [currentTrack, isPlaying, isPlayerOpenInternal, isLyricsOpenInternal, queue, likedSongs, playlists, songPopularity, playedHistory, lyrics, loadingLyrics, lyricsError, smartMood, setIsPlayerOpen, setIsLyricsOpen, playTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist, recordSearchSelection, removeFromHistory, clearHistory, setSmartMood]);

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
