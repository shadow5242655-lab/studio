'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Song, getBestDownload, searchSongs, getLyrics } from '@/lib/music-api';

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

interface MusicContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  isPlayerOpen: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  totalListeningTime: number;
  songPopularity: Record<string, number>;
  playedHistory: string[];
  exclusionRules: ExclusionRule[];
  tasteProfile: any;
  smartMood: boolean;
  lyrics: string | null;
  loadingLyrics: boolean;
  setIsPlayerOpen: (open: boolean) => void;
  playTrack: (track: Song, fromQueue?: Song[]) => void;
  stopTrack: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleLike: (track: Song) => void;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (name: string, initialSongs?: Song[]) => void;
  addToPlaylist: (playlistId: string, track: Song) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  recordSearchSelection: (song: Song) => void;
  removeFromHistory: (songId: string) => void;
  clearHistory: () => void;
  addExclusionRule: (type: 'artist' | 'genre' | 'song', value: string) => void;
  removeExclusionRule: (ruleId: string) => void;
  setTasteProfile: (profile: any) => void;
  setSmartMood: (enabled: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [totalListeningTime, setTotalListeningTime] = useState(0);
  const [songPopularity, setSongPopularity] = useState<Record<string, number>>({});
  const [playedHistory, setPlayedHistory] = useState<string[]>([]);
  const [exclusionRules, setExclusionRules] = useState<ExclusionRule[]>([]);
  const [tasteProfile, setTasteProfileState] = useState<any>(null);
  const [smartMood, setSmartMoodState] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio ref once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    
    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', () => setIsPlaying(true));
      audio.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, []);

  // Handle song end separately to avoid closure issues with queue
  useEffect(() => {
    if (!audioRef.current) return;
    const handleEnded = () => nextTrack();
    audioRef.current.addEventListener('ended', handleEnded);
    return () => audioRef.current?.removeEventListener('ended', handleEnded);
  }, [queue, currentTrack, smartMood]);

  useEffect(() => {
    const savedLikes = localStorage.getItem('ayumusic_likes');
    if (savedLikes) {
      try { setLikedSongs(JSON.parse(savedLikes)); } catch (e) {}
    }

    const savedPlaylists = localStorage.getItem('ayumusic_playlists');
    if (savedPlaylists) {
      try { setPlaylists(JSON.parse(savedPlaylists)); } catch (e) {}
    }

    const savedVol = localStorage.getItem('ayumusic_volume');
    if (savedVol) setVolumeState(parseFloat(savedVol));

    const savedTime = localStorage.getItem('ayumusic_total_time');
    if (savedTime) setTotalListeningTime(parseInt(savedTime, 10));

    const savedPopularity = localStorage.getItem('ayumusic_popularity');
    if (savedPopularity) {
      try { setSongPopularity(JSON.parse(savedPopularity)); } catch (e) {}
    }

    const savedHistory = localStorage.getItem('ayumusic_history');
    if (savedHistory) {
      try { setPlayedHistory(JSON.parse(savedHistory)); } catch (e) {}
    }

    const savedExclusions = localStorage.getItem('ayumusic_exclusions');
    if (savedExclusions) {
      try { setExclusionRules(JSON.parse(savedExclusions)); } catch (e) {}
    }

    const savedTaste = localStorage.getItem('ayumusic_taste');
    if (savedTaste) {
      try { setTasteProfileState(JSON.parse(savedTaste)); } catch (e) {}
    }

    const savedSmartMood = localStorage.getItem('ayumusic_smart_mood');
    if (savedSmartMood) setSmartMoodState(savedSmartMood === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('ayumusic_likes', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('ayumusic_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('ayumusic_total_time', totalListeningTime.toString());
  }, [totalListeningTime]);

  useEffect(() => {
    localStorage.setItem('ayumusic_popularity', JSON.stringify(songPopularity));
  }, [songPopularity]);

  useEffect(() => {
    localStorage.setItem('ayumusic_history', JSON.stringify(playedHistory));
  }, [playedHistory]);

  useEffect(() => {
    localStorage.setItem('ayumusic_exclusions', JSON.stringify(exclusionRules));
  }, [exclusionRules]);

  useEffect(() => {
    localStorage.setItem('ayumusic_taste', JSON.stringify(tasteProfile));
  }, [tasteProfile]);

  useEffect(() => {
    localStorage.setItem('ayumusic_smart_mood', smartMood.toString());
  }, [smartMood]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setTotalListeningTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (currentTrack) {
      setLoadingLyrics(true);
      setLyrics(null);
      getLyrics(currentTrack.id).then(res => {
        setLyrics(res);
        setLoadingLyrics(false);
      }).catch((e) => {
        console.error("Lyrics error:", e);
        setLoadingLyrics(false);
      });
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = useCallback((track: Song, fromQueue?: Song[]) => {
    if (fromQueue) setQueue(fromQueue);
    
    setPlayedHistory(prev => {
      const filtered = prev.filter(id => id !== track.id);
      return [track.id, ...filtered].slice(0, 50);
    });

    const url = getBestDownload(track);
    if (!url) {
      console.warn("No download URL found for track:", track.name);
      return;
    }

    if (audioRef.current) {
      if (currentTrack?.id !== track.id) {
        audioRef.current.src = url;
        setCurrentTrack(track);
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Playback start failed:", err);
      });
    }
  }, [currentTrack, audioRef]);

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setIsPlayerOpen(false);
    setLyrics(null);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const nextTrack = useCallback(async () => {
    if (!currentTrack) return;

    const currentIndex = queue.findIndex(s => s.id === currentTrack.id);
    
    if (currentIndex === queue.length - 1 && smartMood) {
      try {
        const seedQuery = `${currentTrack.name} ${currentTrack.artists.primary[0].name}`;
        const moodSongs = await searchSongs(seedQuery);
        const existingIds = new Set(queue.map(s => s.id));
        const newMoodSongs = moodSongs.filter(s => !existingIds.has(s.id)).slice(0, 10);
        
        if (newMoodSongs.length > 0) {
          const updatedQueue = [...queue, ...newMoodSongs];
          setQueue(updatedQueue);
          playTrack(newMoodSongs[0], updatedQueue);
          return;
        }
      } catch (e) {
        console.error('Mood fetch failed', e);
      }
    }

    if (queue.length > 0) {
      const nextIndex = (currentIndex + 1) % queue.length;
      playTrack(queue[nextIndex]);
    }
  }, [currentTrack, queue, smartMood, playTrack]);

  const prevTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(s => s.id === currentTrack.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playTrack(queue[prevIndex]);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
  };

  const toggleLike = (track: Song) => {
    setLikedSongs(prev => {
      const exists = prev.find(s => s.id === track.id);
      if (exists) {
        return prev.filter(s => s.id !== track.id);
      }
      return [track, ...prev];
    });
  };

  const isLiked = (trackId: string) => {
    return !!likedSongs.find(s => s.id === trackId);
  };

  const createPlaylist = (name: string, initialSongs: Song[] = []) => {
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      songs: initialSongs,
      createdAt: Date.now(),
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
  };

  const addToPlaylist = (playlistId: string, track: Song) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (p.songs.find(s => s.id === track.id)) return p;
        return { ...p, songs: [...p.songs, track] };
      }
      return p;
    }));
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== trackId) };
      }
      return p;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  const recordSearchSelection = (song: Song) => {
    setSongPopularity(prev => ({
      ...prev,
      [song.id]: (prev[song.id] || 0) + 1
    }));
  };

  const removeFromHistory = (songId: string) => {
    setPlayedHistory(prev => prev.filter(id => id !== songId));
  };

  const clearHistory = () => {
    setPlayedHistory([]);
  };

  const addExclusionRule = (type: 'artist' | 'genre' | 'song', value: string) => {
    const newRule: ExclusionRule = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      value
    };
    setExclusionRules(prev => [...prev, newRule]);
  };

  const removeExclusionRule = (ruleId: string) => {
    setExclusionRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const setTasteProfile = (profile: any) => {
    setTasteProfileState(profile);
  };

  const setSmartMood = (enabled: boolean) => {
    setSmartMoodState(enabled);
  };

  return (
    <MusicContext.Provider value={{
      currentTrack, isPlaying, isPlayerOpen, volume, progress, duration, queue, likedSongs, playlists, totalListeningTime, songPopularity, playedHistory, exclusionRules, tasteProfile, smartMood, lyrics, loadingLyrics,
      setIsPlayerOpen, playTrack, stopTrack, togglePlay, nextTrack, prevTrack, seek, setVolume, toggleLike, isLiked,
      createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist, recordSearchSelection, removeFromHistory, clearHistory, addExclusionRule, removeExclusionRule, setTasteProfile, setSmartMood
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
}
