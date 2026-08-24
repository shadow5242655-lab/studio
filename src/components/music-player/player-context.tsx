'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Song, getBestDownload } from '@/lib/music-api';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
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
  setIsPlayerOpen: (open: boolean) => void;
  playTrack: (track: Song, fromQueue?: Song[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleLike: (track: Song) => void;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, track: Song) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  recordSearchSelection: (song: Song) => void;
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Track total time played
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
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    
    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => nextTrack();

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = (track: Song, fromQueue?: Song[]) => {
    if (fromQueue) setQueue(fromQueue);
    
    setPlayedHistory(prev => {
      const filtered = prev.filter(id => id !== track.id);
      return [track.id, ...filtered].slice(0, 50);
    });

    const url = getBestDownload(track);
    if (audioRef.current) {
      if (currentTrack?.id !== track.id) {
        audioRef.current.src = url;
        setCurrentTrack(track);
      }
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(s => s.id === currentTrack.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % queue.length;
    playTrack(queue[nextIndex]);
  };

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

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      songs: [],
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

  return (
    <MusicContext.Provider value={{
      currentTrack, isPlaying, isPlayerOpen, volume, progress, duration, queue, likedSongs, playlists, totalListeningTime, songPopularity, playedHistory,
      setIsPlayerOpen, playTrack, togglePlay, nextTrack, prevTrack, seek, setVolume, toggleLike, isLiked,
      createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist, recordSearchSelection
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
