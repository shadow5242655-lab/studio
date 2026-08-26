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
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

interface MusicProgressContextType {
  progress: number;
  duration: number;
  volume: number;
  isScrubbing: boolean;
  seek: (time: number) => void;
  setIsScrubbing: (scrubbing: boolean) => void;
  setVolume: (vol: number) => void;
}

const MusicStateContext = createContext<MusicStateContextType | undefined>(undefined);
const MusicProgressContext = createContext<MusicProgressContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const currentTrackRef = useRef<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const queueRef = useRef<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playedHistory, setPlayedHistory] = useState<HistoryItem[]>([]);
  
  const [volume, setVolumeState] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const isScrubbingRef = useRef(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    isScrubbingRef.current = isScrubbing;
  }, [isScrubbing]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      console.log('AYUMUSIC: Initializing hardware-stabilized audio engine singleton...');
      const audio = new Audio();
      audio.id = 'audioPlayer';
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";
      audioRef.current = audio;

      const updateProgress = () => {
        if (audioRef.current && !audioRef.current.paused && !isScrubbingRef.current) {
          setProgress(audioRef.current.currentTime);
        }
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      };

      audio.addEventListener('play', () => {
        console.log('AYUMUSIC: Resonance active');
        setIsPlaying(true);
        setIsBuffering(false);
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      });

      audio.addEventListener('pause', () => {
        console.log('AYUMUSIC: Resonance paused');
        setIsPlaying(false);
      });

      audio.addEventListener('waiting', () => setIsBuffering(true));
      audio.addEventListener('playing', () => setIsBuffering(false));
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
        console.log('AYUMUSIC: Duration resolved:', audio.duration);
      });

      audio.addEventListener('ended', () => {
        console.log('AYUMUSIC: Track ended, architecting next track');
        nextTrackInternalRef.current();
      });

      audio.addEventListener('error', (e) => {
        console.error('AYUMUSIC: Audio engine resonance error:', audio.error);
        setIsBuffering(false);
      });
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const playTrack = useCallback((track: Song, fromQueue?: Song[]) => {
    if (!track) return;
    
    const audio = audioRef.current;
    if (!audio) return;

    const url = getBestDownload(track);
    if (!url) {
      console.error('AYUMUSIC: Could not resolve frequency for', track.id);
      toast({ variant: "destructive", title: "Resonance Blocked", description: "Frequency unavailable." });
      return;
    }

    audio.src = url;
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setIsBuffering(true);
    setProgress(0);

    if (fromQueue) {
      setQueue(fromQueue);
      queueRef.current = fromQueue;
    }
    
    setPlayedHistory(prev => [{ id: track.id, name: track.name }, ...prev.filter(i => i.id !== track.id)].slice(0, 50));
    
    audio.play().catch(err => {
      console.error('AYUMUSIC: Play command failed:', err);
      setIsBuffering(false);
    });
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    
    if (audio.paused) {
      audio.play().catch(e => console.error('AYUMUSIC: Toggle play failed:', e));
    } else {
      audio.pause();
    }
  }, [currentTrack]);

  const stopTrack = useCallback(() => {
    console.log('AYUMUSIC: Stopping current sound resonance (✕ Close)');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }
    setCurrentTrack(null);
    currentTrackRef.current = null;
    setIsPlaying(false);
    setIsBuffering(false);
    setProgress(0);
    setDuration(0);
    setIsPlayerOpen(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const playRandomTrack = useCallback(async () => {
    try {
      const trending = await getTrending();
      if (trending.length > 0) {
        const rand = trending[Math.floor(Math.random() * trending.length)];
        playTrack(rand, trending);
      }
    } catch (e) {
      console.error("AYUMUSIC: Random discovery failed", e);
    }
  }, [playTrack]);

  const nextTrack = useCallback(() => {
    const currentQueue = queueRef.current;
    if (currentQueue.length > 0) {
      const idx = currentQueue.findIndex(s => s.id === currentTrackRef.current?.id);
      if (idx !== -1 && idx < currentQueue.length - 1) {
        playTrack(currentQueue[idx + 1]);
        return;
      }
    }
    playRandomTrack();
  }, [playTrack, playRandomTrack]);

  const prevTrack = useCallback(() => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) return;
    const idx = currentQueue.findIndex(s => s.id === currentTrackRef.current?.id);
    if (idx !== -1 && idx > 0) {
      playTrack(currentQueue[idx - 1]);
    }
  }, [playTrack]);

  const nextTrackInternalRef = useRef(nextTrack);
  useEffect(() => {
    nextTrackInternalRef.current = nextTrack;
  }, [nextTrack]);

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
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setPlayedHistory(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setPlayedHistory([]);
  }, []);

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
      toast({ title: 'Lineage Buffered', description: `${decodeEntities(t.name)} is next.` });
    }, 
    addToQueue: (t: Song) => {
      setQueue(prev => {
        const next = prev.find(s => s.id === t.id) ? prev : [...prev, t];
        queueRef.current = next;
        return next;
      });
      toast({ title: 'Resonance Queued', description: `${decodeEntities(t.name)} added.` });
    },
    playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, 
    isLiked: (id: string) => !!likedSongs.find(s => s.id === id), createPlaylist, addToPlaylist, deletePlaylist,
    removeFromHistory, clearHistory
  }), [currentTrack, isPlaying, isBuffering, isPlayerOpen, queue, likedSongs, playlists, playedHistory, playTrack, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, createPlaylist, addToPlaylist, deletePlaylist, removeFromHistory, clearHistory]);

  const progVal = useMemo(() => ({ 
    progress, duration, volume, isScrubbing,
    setIsScrubbing,
    seek: (t: number) => { 
      if (audioRef.current) {
        audioRef.current.currentTime = t;
        setProgress(t);
      }
    }, 
    setVolume: (v: number) => { 
      setVolumeState(v); 
      if (audioRef.current) audioRef.current.volume = v; 
    } 
  }), [progress, duration, volume, isScrubbing]);

  return (
    <MusicStateContext.Provider value={stateVal}>
      <MusicProgressContext.Provider value={progVal}>{children}</MusicProgressContext.Provider>
    </MusicStateContext.Provider>
  );
}

export const useMusic = () => {
  const c = useContext(MusicStateContext);
  if (!c) throw new Error('useMusic context resonance failed');
  return c;
};

export const useMusicProgress = () => {
  const c = useContext(MusicProgressContext);
  if (!c) throw new Error('useMusicProgress context resonance failed');
  return c;
};
