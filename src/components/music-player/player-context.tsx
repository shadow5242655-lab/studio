
'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getTrending, decodeEntities, fetchAudiusMoodTracks, getLyrics } from '@/lib/music-api';
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

export interface LyricsData {
  plain: string;
  synced: { time: number; text: string }[];
}

interface MusicStateContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  isBuffering: boolean;
  isPlayerOpen: boolean;
  isLyricsOpen: boolean;
  loadingLyrics: boolean;
  lyrics: LyricsData | null;
  queue: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  playedHistory: HistoryItem[];
  smartMood: boolean;
  autoMixQueue: Song[];
  setSmartMood: (enabled: boolean) => void;
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
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  
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

  const playTrackInternal = useCallback((track: Song, fromQueue?: Song[]) => {
    if (!track) return;
    const audio = audioRef.current;
    if (!audio) return;

    const url = getBestDownload(track);
    if (!url) {
      toast({ variant: "destructive", title: "Resonance Blocked", description: "Frequency unavailable." });
      return;
    }

    audio.pause();
    audio.src = url;
    audio.load();

    console.log('AYUMUSIC: Initiating playback for:', track.name);
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
      console.warn('AYUMUSIC: Playback interrupted', err);
      setIsBuffering(false);
    });

    const mood = inferMoodFromTrack(track);
    if (smartMood) {
      fetchMoodLineage(mood);
    }
  }, [smartMood]);

  useEffect(() => {
    if (currentTrack) {
      setLoadingLyrics(true);
      getLyrics(currentTrack.id).then(res => {
        setLyrics(res);
        setLoadingLyrics(false);
      });
    } else {
      setLyrics(null);
    }
  }, [currentTrack]);

  const playRandomTrackInternal = useCallback(async () => {
    try {
      const trending = await getTrending();
      if (trending.length > 0) {
        const rand = trending[Math.floor(Math.random() * trending.length)];
        playTrackInternal(rand, trending);
      }
    } catch (e) {}
  }, [playTrackInternal]);

  const nextTrackInternal = useCallback(() => {
    const currentQueue = queueRef.current;
    
    if (currentQueue.length > 0) {
      const currentIdx = currentQueue.findIndex(s => s.id === currentTrackRef.current?.id);
      if (currentIdx !== -1 && currentIdx < currentQueue.length - 1) {
        playTrackInternal(currentQueue[currentIdx + 1]);
        return;
      }
    }

    if (smartMood && autoMixQueueRef.current.length > 0) {
      const nextMoodSong = autoMixQueueRef.current[0];
      setAutoMixQueue(prev => prev.slice(1));
      playTrackInternal(nextMoodSong);
      return;
    }

    playRandomTrackInternal();
  }, [smartMood, playTrackInternal, playRandomTrackInternal]);

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
        nextTrackInternal();
      });
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [nextTrackInternal]);

  useEffect(() => {
    autoMixQueueRef.current = autoMixQueue;
  }, [autoMixQueue]);

  const inferMoodFromTrack = useCallback((track: Song) => {
    const text = (track.name + ' ' + (track.artists.primary[0]?.name || '')).toLowerCase();
    
    if (text.includes('punjabi') || text.includes('diljit') || text.includes('sidhu') || text.includes('shubh')) return 'punjabi';
    if (text.includes('haryanvi') || text.includes('dhanda') || text.includes('sapna')) return 'haryanvi';
    if (text.includes('love') || text.includes('romance') || text.includes('arijit')) return 'romance';
    if (text.includes('lofi') || text.includes('chill') || text.includes('relax')) return 'lofi';
    if (text.includes('bhajan') || text.includes('krishna') || text.includes('devotional')) return 'bhajan';
    if (text.includes('sufi') || text.includes('nusrat') || text.includes('rahat')) return 'sufi';
    
    return 'pop';
  }, []);

  const fetchMoodLineage = useCallback(async (mood: string) => {
    if (!smartMood) return;
    try {
      const resonance = await fetchAudiusMoodTracks(mood);
      if (resonance.length > 0) {
        setAutoMixQueue(resonance);
      }
    } catch (e) {
      console.warn('AYUMUSIC: Failed to fetch neural resonance');
    }
  }, [smartMood]);

  const stateVal = useMemo(() => ({
    currentTrack, isPlaying, isBuffering, isPlayerOpen, isLyricsOpen, loadingLyrics, lyrics,
    queue, likedSongs, playlists, playedHistory, smartMood, autoMixQueue, 
    setSmartMood, setIsPlayerOpen, setIsLyricsOpen,
    playTrack: playTrackInternal, 
    playNext: (t: Song) => {
      setQueue(prev => {
        const next = [...prev.filter(s => s.id !== t.id)];
        const idx = next.findIndex(s => s.id === currentTrackRef.current?.id);
        next.splice(idx + 1, 0, t);
        queueRef.current = next;
        return next;
      });
    }, 
    addToQueue: (t: Song) => {
      setQueue(prev => {
        const next = prev.find(s => s.id === t.id) ? prev : [...prev, t];
        queueRef.current = next;
        return next;
      });
    },
    playRandomTrack: playRandomTrackInternal, 
    stopTrack: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setCurrentTrack(null);
      currentTrackRef.current = null;
      setIsPlaying(false);
      setIsPlayerOpen(false);
    }, 
    togglePlay: () => {
      const audio = audioRef.current;
      if (!audio || !currentTrack) return;
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    }, 
    nextTrack: nextTrackInternal, 
    prevTrack: () => {
      const currentQueue = queueRef.current;
      const idx = currentQueue.findIndex(s => s.id === currentTrackRef.current?.id);
      if (idx > 0) playTrackInternal(currentQueue[idx - 1]);
    }, 
    toggleLike: (track: Song) => {
      setLikedSongs(prev => prev.find(s => s.id === track.id) ? prev.filter(s => s.id !== track.id) : [...prev, track]);
    }, 
    isLiked: (id: string) => !!likedSongs.find(s => s.id === id), 
    createPlaylist: (name: string, songs: Song[] = []) => {
      setPlaylists(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name, songs, createdAt: Date.now() }]);
    }, 
    addToPlaylist: (pId: string, track: Song) => {
      setPlaylists(prev => prev.map(p => p.id === pId ? { ...p, songs: [...p.songs.filter(s => s.id !== track.id), track] } : p));
    }, 
    deletePlaylist: (id: string) => setPlaylists(prev => prev.filter(p => p.id !== id)),
    removeFromHistory: (id: string) => setPlayedHistory(prev => prev.filter(i => i.id !== id)),
    clearHistory: () => setPlayedHistory([])
  }), [currentTrack, isPlaying, isBuffering, isPlayerOpen, isLyricsOpen, loadingLyrics, lyrics, queue, likedSongs, playlists, playedHistory, smartMood, autoMixQueue, playTrackInternal, playRandomTrackInternal, nextTrackInternal]);

  const progVal = useMemo(() => ({ 
    progress, duration, volume, isScrubbing, setIsScrubbing,
    seek: (t: number) => { 
      if (audioRef.current) audioRef.current.currentTime = t;
      setProgress(t);
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
  if (!c) throw new Error('useMusic resonance failed');
  return c;
};

export const useMusicProgress = () => {
  const c = useContext(MusicProgressContext);
  if (!c) throw new Error('useMusicProgress resonance failed');
  return c;
};
