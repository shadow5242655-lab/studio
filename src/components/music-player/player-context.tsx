
'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getTrending, decodeEntities, searchSongs } from '@/lib/music-api';
import { toast } from '@/hooks/use-toast';
import { analyzeMood } from '@/ai/flows/mood-analysis-flow';

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
  smartMood: boolean;
  autoMixQueue: Song[];
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
  setSmartMood: (enabled: boolean) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
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
  const [volume, setVolumeState] = useState(0.8);
  const volumeRef = useRef(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [smartMood, setSmartMood] = useState(true);
  const [autoMixQueue, setAutoMixQueue] = useState<Song[]>([]);
  const autoMixQueueRef = useRef<Song[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);

  // High-fidelity Audio Engine Initialization
  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      console.log('AYUMUSIC: Initializing hardware-stabilized audio engine...');
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";
      audioRef.current = audio;

      const handlers = {
        loadedmetadata: () => {
          console.log('AYUMUSIC: Metadata loaded, duration:', audio.duration);
          setDuration(audio.duration);
        },
        timeupdate: () => {
          // Fallback for non-rAF browsers
          if (!frameRef.current) setProgress(audio.currentTime);
        },
        ended: () => {
          console.log('AYUMUSIC: Sound lineage reached conclusion, transitioning...');
          if (nextTrackRef.current) nextTrackRef.current();
        },
        play: () => {
          console.log('AYUMUSIC: Playback resonance confirmed');
          setIsPlaying(true);
          isPlayingRef.current = true;
        },
        pause: () => {
          console.log('AYUMUSIC: Playback resonance suspended');
          setIsPlaying(false);
          isPlayingRef.current = false;
        },
        waiting: () => {
          console.log('AYUMUSIC: Buffering frequencies...');
          setIsBuffering(true);
        },
        playing: () => {
          console.log('AYUMUSIC: Buffering complete, streaming resonance');
          setIsBuffering(false);
        },
        error: (e: any) => {
          console.error('AYUMUSIC: Audio engine resonance failure', e);
          setIsBuffering(false);
          toast({ variant: "destructive", title: "Resonance Blocked", description: "The audio stream could not be established." });
        }
      };

      Object.entries(handlers).forEach(([event, handler]) => {
        audio.addEventListener(event, handler);
      });

      return () => {
        Object.entries(handlers).forEach(([event, handler]) => {
          audio.removeEventListener(event, handler);
        });
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }
  }, []);

  const updateProgress = useCallback(() => {
    if (audioRef.current && isPlayingRef.current) {
      setProgress(audioRef.current.currentTime);
      frameRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      frameRef.current = requestAnimationFrame(updateProgress);
    } else if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, [isPlaying, updateProgress]);

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
    if (!track || !audioRef.current) return;
    
    console.log('AYUMUSIC: Initiating discovery for:', decodeEntities(track.name));
    const audio = audioRef.current;
    const url = getBestDownload(track);
    
    if (!url) {
      console.warn('AYUMUSIC: No valid download frequency found for track');
      toast({ variant: "destructive", title: "Resonance Blocked", description: "This frequency is currently unavailable." });
      return;
    }

    // High-fidelity state preparation
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setIsBuffering(true);
    setProgress(0);
    setDuration(track.duration || 0);

    if (fromQueue) {
      setQueue(fromQueue);
      queueRef.current = fromQueue;
    }
    
    setPlayedHistory(prev => [{ id: track.id, name: track.name }, ...prev.filter(i => i.id !== track.id)].slice(0, 50));
    
    // Execute stream resonance
    audio.pause();
    audio.src = url;
    audio.volume = volumeRef.current;
    audio.load();
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.error("AYUMUSIC: Playback initiation blocked:", e);
        setIsBuffering(false);
        if (e.name === 'NotAllowedError') {
          toast({ title: "Action Required", description: "Please tap anywhere to enable playback." });
        }
      });
    }
  }, []);

  const playRandomTrack = useCallback(async () => {
    try {
      console.log('AYUMUSIC: Shuffling trending soundscapes...');
      const trending = await getTrending();
      if (trending.length > 0) {
        const rand = trending[Math.floor(Math.random() * trending.length)];
        playTrack(rand, trending);
      }
    } catch (e) {
      console.error("AYUMUSIC: Shuffle architecting failed", e);
    }
  }, [playTrack]);

  const nextTrack = useCallback(() => {
    const currentQueue = queueRef.current;
    const currentMix = autoMixQueueRef.current;

    console.log('AYUMUSIC: Transitioning to next sound frequency...');
    
    if (currentQueue.length > 0) {
      const idx = currentQueue.findIndex(s => s.id === currentTrackRef.current?.id);
      if (idx !== -1 && idx < currentQueue.length - 1) {
        playTrack(currentQueue[idx + 1]);
        return;
      }
    }

    if (currentMix.length > 0) {
      const next = currentMix[0];
      autoMixQueueRef.current = currentMix.slice(1);
      setAutoMixQueue(autoMixQueueRef.current);
      playTrack(next);
      return;
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

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlayingRef.current) {
        audio.pause();
      } else {
        const p = audio.play();
        if (p) p.catch(() => {});
      }
    }
  }, []);

  const nextTrackRef = useRef(nextTrack);
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  // Neural Auto-Mix Intelligence (Default ON)
  useEffect(() => {
    if (smartMood && currentTrack) {
      const architectAutoMix = async () => {
        try {
          const analysis = await analyzeMood({ 
            songName: currentTrack.name, 
            artistName: currentTrack.artists.primary[0]?.name || 'Unknown' 
          });
          
          const searchPromises = analysis.nextQueries.map(q => searchSongs(q, 1));
          const searchResults = await Promise.all(searchPromises);
          const newSongs = searchResults.flatMap(r => r).filter(s => s.id !== currentTrack.id);
          
          const uniqueSongs = Array.from(new Map(newSongs.map(s => [s.id, s])).values());
          const mix = uniqueSongs.slice(0, 10);
          setAutoMixQueue(mix);
          autoMixQueueRef.current = mix;
          console.log('AYUMUSIC: Neural auto-mix architected with', mix.length, 'tracks');
        } catch (e) {
          console.error("AYUMUSIC: Neural architecting failure", e);
        }
      };
      architectAutoMix();
    }
  }, [currentTrack, smartMood]);

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
    setPlayedHistory(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setPlayedHistory([]);
  }, []);

  const stateVal = useMemo(() => ({
    currentTrack, isPlaying, isBuffering, isPlayerOpen, queue, likedSongs, playlists,
    playedHistory, smartMood, autoMixQueue, setIsPlayerOpen, playTrack, playNext: (t: Song) => {
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
    isLiked: (id: string) => !!likedSongs.find(s => s.id === id), createPlaylist, addToPlaylist, deletePlaylist,
    setSmartMood, removeFromHistory, clearHistory
  }), [currentTrack, isPlaying, isBuffering, isPlayerOpen, queue, likedSongs, playlists, playedHistory, smartMood, autoMixQueue, playTrack, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, createPlaylist, addToPlaylist, deletePlaylist, setSmartMood, removeFromHistory, clearHistory]);

  const progVal = useMemo(() => ({ 
    progress, duration, volume,
    seek: (t: number) => { 
      if (audioRef.current) {
        audioRef.current.currentTime = t;
        setProgress(t);
        console.log('AYUMUSIC: Seeking resonance to', t);
      }
    }, 
    setVolume: (v: number) => { 
      setVolumeState(v); 
      volumeRef.current = v; 
      if (audioRef.current) audioRef.current.volume = v; 
    } 
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
