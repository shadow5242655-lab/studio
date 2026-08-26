
'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getTrending, decodeEntities, fetchAudiusMoodTracks } from '@/lib/music-api';
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
  songData?: Song;
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
  setSmartMood: (enabled: boolean) => void;
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
  
  const [smartMood, setSmartMood] = useState(true);
  const [autoMixQueue, setAutoMixQueue] = useState<Song[]>([]);
  const autoMixQueueRef = useRef<Song[]>([]);

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
        setIsPlaying(true);
        setIsBuffering(false);
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      });

      audio.addEventListener('pause', () => {
        setIsPlaying(false);
      });

      audio.addEventListener('waiting', () => setIsBuffering(true));
      audio.addEventListener('playing', () => setIsBuffering(false));
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('ended', () => {
        console.log('AYUMUSIC: Resonance cycle complete. Initiating neural mood transition.');
        nextTrackInternalRef.current();
      });

      audio.addEventListener('error', () => {
        setIsBuffering(false);
      });
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    autoMixQueueRef.current = autoMixQueue;
  }, [autoMixQueue]);

  const inferMoodFromTrack = useCallback((track: Song) => {
    const text = (track.name + ' ' + (track.artists.primary[0]?.name || '')).toLowerCase();
    
    if (text.includes('punjabi') || text.includes('diljit') || text.includes('sidhu') || text.includes('moosewala') || text.includes('jassi') || text.includes('guru randhawa') || text.includes('shubh') || text.includes('ap dhillon')) return 'punjabi';
    if (text.includes('haryanvi') || text.includes('dhanda') || text.includes('sapna') || text.includes('gulzaar') || text.includes('vishwa') || text.includes('mitta')) return 'haryanvi';
    if (text.includes('love') || text.includes('romance') || text.includes('ishq') || text.includes('dil') || text.includes('pyar') || text.includes('aashiqui') || text.includes('arijit')) return 'romance';
    if (text.includes('party') || text.includes('dance') || text.includes('dj') || text.includes('club') || text.includes('hip hop') || text.includes('rap') || text.includes('badshah') || text.includes('honey singh')) return 'party';
    if (text.includes('lofi') || text.includes('chill') || text.includes('sleep') || text.includes('relax') || text.includes('rain') || text.includes('ambient')) return 'lofi';
    
    return 'trending';
  }, []);

  const fetchMoodLineage = useCallback(async (mood: string) => {
    if (!smartMood) return;
    try {
      console.log(`AYUMUSIC: Fetching mood resonance lineage for: "${mood}"`);
      const resonance = await fetchAudiusMoodTracks(mood);
      if (resonance.length > 0) {
        setAutoMixQueue(resonance);
        console.log(`AYUMUSIC: Neural lineage established with ${resonance.length} frequencies.`);
      }
    } catch (e) {
      console.warn('AYUMUSIC: Failed to fetch mood resonance');
    }
  }, [smartMood]);

  const playTrack = useCallback((track: Song, fromQueue?: Song[]) => {
    if (!track) return;
    const audio = audioRef.current;
    if (!audio) return;

    const url = getBestDownload(track);
    if (!url) {
      toast({ variant: "destructive", title: "Resonance Blocked", description: "Frequency unavailable." });
      return;
    }

    audio.pause();
    audio.src = "";
    audio.load();

    console.log('AYUMUSIC: Initiating high-velocity resonance for:', track.name);
    audio.src = url;
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setIsBuffering(true);
    setProgress(0);

    if (fromQueue) {
      setQueue(fromQueue);
      queueRef.current = fromQueue;
    }
    
    setPlayedHistory(prev => [{ id: track.id, name: track.name, songData: track }, ...prev.filter(i => i.id !== track.id)].slice(0, 50));
    
    audio.play().catch((err) => {
      console.error('AYUMUSIC: Play error:', err);
      setIsBuffering(false);
    });

    if (smartMood) {
      const mood = inferMoodFromTrack(track);
      fetchMoodLineage(mood);
    }
  }, [smartMood, inferMoodFromTrack, fetchMoodLineage]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentTrack]);

  const stopTrack = useCallback(() => {
    console.log('AYUMUSIC: Hard kill on sound lineage.');
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
    } catch (e) {}
  }, [playTrack]);

  const nextTrack = useCallback(() => {
    const currentQueue = queueRef.current;
    const currentMood = currentTrackRef.current ? inferMoodFromTrack(currentTrackRef.current) : null;

    if (currentQueue.length > 0) {
      const currentIdx = currentQueue.findIndex(s => s.id === currentTrackRef.current?.id);
      
      // Try finding next same-mood track in queue
      const nextSameMood = currentQueue.slice(currentIdx + 1).find(s => inferMoodFromTrack(s) === currentMood);
      if (nextSameMood) {
        playTrack(nextSameMood);
        return;
      }

      // Default to next in queue if no mood match
      if (currentIdx !== -1 && currentIdx < currentQueue.length - 1) {
        playTrack(currentQueue[currentIdx + 1]);
        return;
      }
    }

    if (smartMood && autoMixQueueRef.current.length > 0) {
      const nextMoodSong = autoMixQueueRef.current[0];
      setAutoMixQueue(prev => prev.slice(1));
      console.log('AYUMUSIC: Transitioning to infinite mood resonance');
      playTrack(nextMoodSong);
      return;
    }

    playRandomTrack();
  }, [playTrack, playRandomTrack, smartMood, inferMoodFromTrack]);

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
    playedHistory, smartMood, autoMixQueue, setSmartMood, setIsPlayerOpen, playTrack, 
    playNext: (t: Song) => {
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
  }), [currentTrack, isPlaying, isBuffering, isPlayerOpen, queue, likedSongs, playlists, playedHistory, smartMood, autoMixQueue, playTrack, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, createPlaylist, addToPlaylist, deletePlaylist, removeFromHistory, clearHistory]);

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
