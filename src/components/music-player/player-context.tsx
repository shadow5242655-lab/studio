'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getTrending, decodeEntities } from '@/lib/music-api';
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
  queue: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  playedHistory: HistoryItem[];
  setIsPlayerOpen: (open: boolean) => void;
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
  const [queue, setQueue] = useState<Song[]>([]);
  const queueRef = useRef<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playedHistory, setPlayedHistory] = useState<HistoryItem[]>([]);
  const [volume, setVolumeState] = useState(0.7);
  const volumeRef = useRef(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const stopTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    setProgress(0);
  }, []);

  const playTrack = useCallback((track: Song, fromQueue?: Song[]) => {
    if (!track) return;
    
    // Stop current resonance
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    if (fromQueue) {
      setQueue(fromQueue);
      queueRef.current = fromQueue;
    }
    
    setProgress(0);
    setDuration(track.duration || 0);
    setCurrentTrack(track);
    currentTrackRef.current = track;
    
    setPlayedHistory(prev => [{ id: track.id, name: track.name }, ...prev.filter(i => i.id !== track.id)].slice(0, 50));
    
    const url = getBestDownload(track);
    if (audioRef.current && url) {
      audioRef.current.src = url;
      audioRef.current.volume = volumeRef.current;
      audioRef.current.play().catch(e => {
        console.error("Playback failed:", e);
        toast({ variant: "destructive", title: "Playback Error", description: "Could not stream the selected track." });
      });
    }
  }, []);

  const playRandomTrack = useCallback(async () => {
    const trending = await getTrending();
    if (trending.length > 0) {
      const rand = trending[Math.floor(Math.random() * trending.length)];
      playTrack(rand, trending);
    }
  }, [playTrack]);

  const nextTrack = useCallback(() => {
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
  }, [playTrack, playRandomTrack]);

  const prevTrack = useCallback(() => {
    if (queueRef.current.length === 0) return;
    const idx = queueRef.current.findIndex(s => s.id === currentTrackRef.current?.id);
    if (idx !== -1 && idx > 0) {
      playTrack(queueRef.current[idx - 1]);
    }
  }, [playTrack]);

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

  const updateProgress = useCallback(() => {
    if (audioRef.current && isPlayingRef.current) {
      setProgress(audioRef.current.currentTime);
      frameRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const hs = {
      loadedmetadata: () => setDuration(audio.duration),
      ended: () => nextTrack(),
      play: () => { setIsPlaying(true); isPlayingRef.current = true; },
      pause: () => { setIsPlaying(false); isPlayingRef.current = false; },
      waiting: () => setIsBuffering(true),
      playing: () => setIsBuffering(false)
    };
    Object.entries(hs).forEach(([e, f]) => audio.addEventListener(e, f));
    
    return () => {
      Object.entries(hs).forEach(([e, f]) => audio.removeEventListener(e, f));
      audio.pause();
      audio.src = "";
    };
  }, [nextTrack]);

  useEffect(() => {
    if (isPlaying) frameRef.current = requestAnimationFrame(updateProgress);
    else if (frameRef.current) cancelAnimationFrame(frameRef.current);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [isPlaying, updateProgress]);

  const stateVal = useMemo(() => ({
    currentTrack, isPlaying, isBuffering, isPlayerOpen, queue, likedSongs, playlists,
    playedHistory, setIsPlayerOpen, playTrack, playNext: (t: Song) => {
      setQueue(prev => {
        const next = [...prev.filter(s => s.id !== t.id)];
        const idx = next.findIndex(s => s.id === currentTrackRef.current?.id);
        next.splice(idx + 1, 0, t);
        queueRef.current = next;
        return next;
      });
      toast({ title: 'Ordered', description: `"${decodeEntities(t.name)}" is next.` });
    }, 
    addToQueue: (t: Song) => {
      setQueue(prev => {
        const next = prev.find(s => s.id === t.id) ? prev : [...prev, t];
        queueRef.current = next;
        return next;
      });
      toast({ title: 'Buffered', description: `"${decodeEntities(t.name)}" added to queue.` });
    },
    playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, 
    isLiked: (id: string) => !!likedSongs.find(s => s.id === id), createPlaylist, addToPlaylist, deletePlaylist
  }), [currentTrack, isPlaying, isBuffering, isPlayerOpen, queue, likedSongs, playlists, playedHistory, playTrack, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, createPlaylist, addToPlaylist, deletePlaylist]);

  const progVal = useMemo(() => ({ 
    progress, duration, volume,
    seek: (t: number) => { if (audioRef.current) audioRef.current.currentTime = t; setProgress(t); }, 
    setVolume: (v: number) => { setVolumeState(v); volumeRef.current = v; if (audioRef.current) audioRef.current.volume = v; } 
  }), [progress, duration, volume]);

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
