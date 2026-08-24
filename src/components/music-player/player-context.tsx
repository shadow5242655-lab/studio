
'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getTrending, searchSongs, applySmartRank3 } from '@/lib/music-api';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export interface ExclusionRule {
  id: string;
  type: 'artist' | 'genre' | 'song';
  value: string;
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
  isLyricsOpen: boolean;
  queue: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  playedHistory: HistoryItem[];
  activeDays: string[];
  exclusionRules: ExclusionRule[];
  smartMood: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';
  lyrics: { synced: { time: number; text: string }[]; plain: string } | null;
  loadingLyrics: boolean;
  totalMinutes: number;
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
  deletePlaylist: (playlistId: string) => void;
  removeFromHistory: (songId: string) => void;
  clearHistory: () => void;
  addExclusionRule: (type: 'artist' | 'genre' | 'song', value: string) => void;
  removeExclusionRule: (id: string) => void;
  setSmartMood: (enabled: boolean) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  songPopularity: Record<string, number>;
  recordSearchSelection: (song: Song) => void;
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
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playedHistory, setPlayedHistory] = useState<HistoryItem[]>([]);
  const [activeDays, setActiveDays] = useState<string[]>([]);
  const [exclusionRules, setExclusionRules] = useState<ExclusionRule[]>([]);
  const [smartMood, setSmartMoodState] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [songPopularity, setSongPopularity] = useState<Record<string, number>>({});
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [lyrics, setLyrics] = useState<{ synced: any[]; plain: string } | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const secondaryAudioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastProgressUpdateRef = useRef<number>(0);
  const totalSecondsAccumulatorRef = useRef<number>(0);
  const isCrossfadingRef = useRef(false);

  const recordActiveDay = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setActiveDays(prev => {
      if (prev.includes(today)) return prev;
      const next = [...prev, today];
      localStorage.setItem('ayumusics_activedays', JSON.stringify(next));
      return next;
    });
  }, []);

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
    recordActiveDay();
    setPlayedHistory(prev => {
      const historyItem: HistoryItem = { id: track.id, name: track.name };
      const next = [historyItem, ...prev.filter(item => item.id !== track.id)].slice(0, 50);
      localStorage.setItem('ayumusics_history', JSON.stringify(next));
      return next;
    });
    setSongPopularity(prev => {
      const next = { ...prev, [track.id]: (prev[track.id] || 0) + 1 };
      localStorage.setItem('ayumusics_popularity', JSON.stringify(next));
      return next;
    });

    const url = getBestDownload(track);
    if (audioRef.current && url) {
      localStorage.setItem('ayumusics_last_track', JSON.stringify(track));
      if (currentTrack?.id === track.id && audioRef.current.src === url) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
        return;
      }
      audioRef.current.src = url;
      audioRef.current.volume = volume;
      setCurrentTrack(track);
      fetchLyrics(track);
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrack, recordActiveDay, volume]);

  const playNext = useCallback((track: Song) => {
    setQueue(prev => {
      const idx = prev.findIndex(s => s.id === (currentTrack?.id || ''));
      const nextQueue = [...prev];
      nextQueue.splice(idx + 1, 0, track);
      return nextQueue;
    });
  }, [currentTrack]);

  const addToQueue = useCallback((track: Song) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const playRandomTrack = useCallback(async () => {
    const trending = await getTrending();
    if (trending.length > 0) {
      const randomTrack = trending[Math.floor(Math.random() * trending.length)];
      playTrack(randomTrack, trending);
    }
  }, [playTrack]);

  const performCrossfade = useCallback((nextSong: Song) => {
    if (!audioRef.current || !secondaryAudioRef.current || isCrossfadingRef.current) return;
    isCrossfadingRef.current = true;
    
    const nextUrl = getBestDownload(nextSong);
    const primary = audioRef.current;
    const secondary = secondaryAudioRef.current;

    secondary.src = nextUrl;
    secondary.volume = 0;
    secondary.play().then(() => {
      let step = 0;
      const duration = 3000;
      const interval = 50;
      const steps = duration / interval;

      const fade = setInterval(() => {
        step++;
        const ratio = step / steps;
        primary.volume = Math.max(0, volume * (1 - ratio));
        secondary.volume = Math.min(volume, volume * ratio);

        if (step >= steps) {
          clearInterval(fade);
          primary.pause();
          primary.src = secondary.src;
          primary.currentTime = secondary.currentTime;
          primary.volume = volume;
          
          setCurrentTrack(nextSong);
          fetchLyrics(nextSong);
          isCrossfadingRef.current = false;
        }
      }, interval);
    }).catch(() => {
      isCrossfadingRef.current = false;
      playTrack(nextSong);
    });
  }, [volume, playTrack]);

  const handleInfiniteDiscovery = useCallback(async (baseTrack: Song) => {
    const artistName = baseTrack.artists.primary[0]?.name || "";
    const trackName = baseTrack.name.split(' ')[0] || "";
    const query = `${artistName} ${trackName}`.trim() || "Trending Hits";
    try {
      const results = await searchSongs(query);
      const filtered = results.filter(s => s.id !== baseTrack.id);
      const ranked = applySmartRank3(filtered, songPopularity);
      if (ranked.length > 0) playTrack(ranked[0]);
      else await playRandomTrack();
    } catch (e) {
      await playRandomTrack();
    }
  }, [songPopularity, playTrack, playRandomTrack]);

  const nextTrack = useCallback(() => {
    if (!currentTrack) {
      playRandomTrack();
      return;
    }

    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    const idx = queue.findIndex(s => s.id === currentTrack.id);
    if (idx !== -1 && idx < queue.length - 1) {
      playTrack(queue[idx + 1]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      playTrack(queue[0]);
    } else {
      handleInfiniteDiscovery(currentTrack);
    }
  }, [currentTrack, queue, playTrack, handleInfiniteDiscovery, playRandomTrack, repeatMode]);

  const prevTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex(s => s.id === currentTrack.id);
    if (idx !== -1 && idx > 0) {
      playTrack(queue[idx - 1]);
    } else {
      playTrack(queue[queue.length - 1]);
    }
  }, [currentTrack, queue, playTrack]);

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
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
    if (secondaryAudioRef.current) secondaryAudioRef.current.volume = vol;
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
    const newPlaylist: Playlist = { id: Math.random().toString(36).substr(2, 9), name, songs, createdAt: Date.now() };
    setPlaylists(prev => {
      const next = [...prev, newPlaylist];
      localStorage.setItem('ayumusics_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const addToPlaylist = useCallback((playlistId: string, track: Song) => {
    setPlaylists(prev => {
      const next = prev.map(p => 
        p.id === playlistId 
          ? { ...p, songs: p.songs.find(s => s.id === track.id) ? p.songs : [...p.songs, track] }
          : p
      );
      localStorage.setItem('ayumusics_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => {
      const next = prev.filter(p => p.id !== playlistId);
      localStorage.setItem('ayumusics_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((songId: string) => {
    setPlayedHistory(prev => {
      const next = prev.filter(item => item.id !== songId);
      localStorage.setItem('ayumusics_history', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setPlayedHistory([]);
    localStorage.removeItem('ayumusics_history');
  }, []);

  const addExclusionRule = useCallback((type: 'artist' | 'genre' | 'song', value: string) => {
    const newRule: ExclusionRule = { id: Math.random().toString(36).substr(2, 9), type, value };
    setExclusionRules(prev => {
      const next = [...prev, newRule];
      localStorage.setItem('ayumusics_rules', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeExclusionRule = useCallback((id: string) => {
    setExclusionRules(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem('ayumusics_rules', JSON.stringify(next));
      return next;
    });
  }, []);

  const setSmartMood = useCallback((enabled: boolean) => {
    setSmartMoodState(enabled);
    localStorage.setItem('ayumusics_smartmood', JSON.stringify(enabled));
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const recordSearchSelection = useCallback((song: Song) => {
    setSongPopularity(prev => {
      const next = { ...prev, [song.id]: (prev[song.id] || 0) + 1 };
      localStorage.setItem('ayumusics_popularity', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProgress = useCallback(() => {
    if (audioRef.current && isPlaying) {
      const currentTime = audioRef.current.currentTime;
      const timeLeft = audioRef.current.duration - currentTime;
      const now = performance.now();
      
      if (now - lastProgressUpdateRef.current > 100) {
        setProgress(currentTime);
        localStorage.setItem('ayumusics_last_pos', currentTime.toString());
        lastProgressUpdateRef.current = now;
      }

      // 3-second Crossfade trigger
      if (timeLeft < 3 && !isCrossfadingRef.current && repeatMode !== 'one') {
         const idx = queue.findIndex(s => s.id === (currentTrack?.id || ''));
         if (idx !== -1 && idx < queue.length - 1) {
           performCrossfade(queue[idx + 1]);
         }
      }
      
      if (lastTimeRef.current > 0) {
        const diff = currentTime - lastTimeRef.current;
        if (diff > 0 && diff < 2) {
          totalSecondsAccumulatorRef.current += diff;
          if (Math.floor(totalSecondsAccumulatorRef.current) > totalSeconds && 
              Math.floor(totalSecondsAccumulatorRef.current) % 5 === 0) {
            const rounded = Math.floor(totalSecondsAccumulatorRef.current);
            setTotalSeconds(rounded);
            localStorage.setItem('ayumusics_seconds', rounded.toString());
            recordActiveDay();
          }
        }
      }
      lastTimeRef.current = currentTime;
      frameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying, totalSeconds, recordActiveDay, queue, currentTrack, repeatMode, performCrossfade]);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    if (!secondaryAudioRef.current) secondaryAudioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => !isCrossfadingRef.current && nextTrack(); 
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', () => setIsBuffering(false));

    // Restore last track and position
    const savedLiked = localStorage.getItem('ayumusics_liked');
    if (savedLiked) setLikedSongs(JSON.parse(savedLiked));
    const savedPlaylists = localStorage.getItem('ayumusics_playlists');
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
    const savedHistory = localStorage.getItem('ayumusics_history');
    if (savedHistory) setPlayedHistory(JSON.parse(savedHistory));
    const savedDays = localStorage.getItem('ayumusics_activedays');
    if (savedDays) setActiveDays(JSON.parse(savedDays));
    const savedRules = localStorage.getItem('ayumusics_rules');
    if (savedRules) setExclusionRules(JSON.parse(savedRules));
    const savedSmartMood = localStorage.getItem('ayumusics_smartmood');
    if (savedSmartMood) setSmartMoodState(JSON.parse(savedSmartMood));
    const savedPop = localStorage.getItem('ayumusics_popularity');
    if (savedPop) setSongPopularity(JSON.parse(savedPop));
    
    const lastTrackStr = localStorage.getItem('ayumusics_last_track');
    const lastPosStr = localStorage.getItem('ayumusics_last_pos');
    if (lastTrackStr && lastPosStr) {
      const track = JSON.parse(lastTrackStr);
      const pos = parseFloat(lastPosStr);
      setCurrentTrack(track);
      audio.src = getBestDownload(track);
      audio.currentTime = pos;
      setProgress(pos);
      fetchLyrics(track);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
    };
  }, [nextTrack]);

  useEffect(() => {
    if (isPlaying) frameRef.current = requestAnimationFrame(updateProgress);
    else {
      lastTimeRef.current = 0;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, updateProgress]);

  const stateValue = useMemo(() => ({
    currentTrack, isPlaying, isBuffering, isPlayerOpen, isLyricsOpen, queue, likedSongs, playlists,
    playedHistory, activeDays, exclusionRules, smartMood, isShuffle, repeatMode,
    lyrics, loadingLyrics, songPopularity, totalMinutes: Math.floor(totalSeconds / 60),
    setIsPlayerOpen, setIsLyricsOpen, playTrack, playNext, addToQueue, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, createPlaylist, addToPlaylist, deletePlaylist,
    removeFromHistory, clearHistory, addExclusionRule, removeExclusionRule, setSmartMood, toggleShuffle, toggleRepeat, recordSearchSelection
  }), [currentTrack, isPlaying, isBuffering, isPlayerOpen, isLyricsOpen, queue, likedSongs, playlists, playedHistory, activeDays, exclusionRules, smartMood, isShuffle, repeatMode, lyrics, loadingLyrics, songPopularity, totalSeconds, playTrack, playNext, addToQueue, playRandomTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, createPlaylist, addToPlaylist, deletePlaylist, removeFromHistory, clearHistory, addExclusionRule, removeExclusionRule, setSmartMood, toggleShuffle, toggleRepeat, recordSearchSelection]);

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
