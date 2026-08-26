'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getTrending, decodeEntities, fetchAudiusMoodTracks, getLyrics, attachMood } from '@/lib/music-api';
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

    console.log('AYUMUSIC: Playing:', track.name, '| Mood:', track.mood);
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
      console.warn('AYUMUSIC: Playback failed', err);
      setIsBuffering(false);
    });

    // Spotify-style: Pre-fetch next recommendations immediately
    if (smartMood) {
      const mood = track.mood || 'pop';
      fetchAudiusMoodTracks(mood).then(res => {
        autoMixQueueRef.current = res;
        setAutoMixQueue(res);
      });
    }
  }, [smartMood]);

  const startAutoRecommendation = useCallback(async () => {
    const lastSong = currentTrackRef.current;
    const mood = lastSong?.mood || 'pop';
    
    console.log('AYUMUSIC NEURAL: Starting autoplay discovery for mood:', mood);

    // 1. Try pre-fetched queue first
    if (autoMixQueueRef.current.length > 0) {
      const nextBatch = [...autoMixQueueRef.current];
      const nextSong = nextBatch.shift()!;
      
      // Hardware-stabilized handover: update current queue so it keeps looping
      queueRef.current = [nextSong, ...nextBatch];
      setQueue([nextSong, ...nextBatch]);
      autoMixQueueRef.current = nextBatch;
      setAutoMixQueue(nextBatch);
      
      console.log('AYUMUSIC NEURAL: Playing from pre-fetched mood queue:', nextSong.name);
      playTrackInternal(nextSong);
      return;
    }

    // 2. Fetch fresh resonance if pre-fetch failed or is empty
    try {
      const resonance = await fetchAudiusMoodTracks(mood);
      if (resonance.length > 0) {
        const nextSong = resonance.shift()!;
        queueRef.current = [nextSong, ...resonance];
        setQueue([nextSong, ...resonance]);
        console.log('AYUMUSIC NEURAL: Initiating fresh mood resonance:', nextSong.name);
        playTrackInternal(nextSong);
      } else {
        // 3. Fallback: Trending if no mood matches found
        console.log('AYUMUSIC NEURAL: No mood matches. Falling back to trending.');
        const trending = await getTrending();
        if (trending.length > 0) {
          const nextSong = trending.shift()!;
          queueRef.current = [nextSong, ...trending];
          setQueue([nextSong, ...trending]);
          playTrackInternal(nextSong);
        }
      }
    } catch (e) {
      console.error('AYUMUSIC NEURAL: Autoplay fetch failed', e);
    }
  }, [playTrackInternal]);

  const nextTrackInternal = useCallback(() => {
    const currentQueue = queueRef.current;
    const currentSong = currentTrackRef.current;
    
    // Case 1: More songs in current queue/playlist -> play next
    if (currentQueue.length > 0) {
      const currentIdx = currentQueue.findIndex(s => s.id === currentSong?.id);
      if (currentIdx !== -1 && currentIdx < currentQueue.length - 1) {
        console.log('AYUMUSIC: Playing next in queue sequence');
        playTrackInternal(currentQueue[currentIdx + 1]);
        return;
      }
    }

    // Case 2: Queue empty/ended -> initiate Spotify-style autoplay discovery
    if (smartMood) {
      startAutoRecommendation();
    } else {
      setIsPlaying(false);
    }
  }, [playTrackInternal, startAutoRecommendation, smartMood]);

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

      audio.onended = () => {
        console.log('AYUMUSIC: Song ended. Determining next resonance...');
        nextTrackInternal();
      };
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [nextTrackInternal]);

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
    playRandomTrack: async () => {
       const trending = await getTrending();
       if (trending.length > 0) {
         playTrackInternal(trending[0], trending);
       }
    }, 
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
  }), [currentTrack, isPlaying, isBuffering, isPlayerOpen, isLyricsOpen, loadingLyrics, lyrics, queue, likedSongs, playlists, playedHistory, smartMood, autoMixQueue, playTrackInternal, nextTrackInternal]);

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
  if (!c) return {
    currentTrack: null, isPlaying: false, isBuffering: false, isPlayerOpen: false, isLyricsOpen: false, 
    loadingLyrics: false, lyrics: null, queue: [], likedSongs: [], playlists: [], playedHistory: [],
    smartMood: true, autoMixQueue: [], setSmartMood: () => {}, setIsPlayerOpen: () => {}, setIsLyricsOpen: () => {},
    playTrack: () => {}, playNext: () => {}, addToQueue: () => {}, playRandomTrack: async () => {}, 
    stopTrack: () => {}, togglePlay: () => {}, nextTrack: () => {}, prevTrack: () => {}, 
    toggleLike: () => {}, isLiked: () => false, createPlaylist: () => {}, addToPlaylist: () => {}, 
    deletePlaylist: () => {}, removeFromHistory: () => {}, clearHistory: () => {}
  } as unknown as MusicStateContextType;
  return c;
};

export const useMusicProgress = () => {
  const c = useContext(MusicProgressContext);
  if (!c) return {
    progress: 0, duration: 0, volume: 0.8, isScrubbing: false, seek: () => {}, setIsScrubbing: () => {}, setVolume: () => {}
  } as unknown as MusicProgressContextType;
  return c;
};