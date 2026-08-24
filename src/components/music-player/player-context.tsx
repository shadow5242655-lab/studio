'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

type PlayerView = 'cover' | 'lyrics';

interface MusicStateContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  isPlayerOpen: boolean;
  playerView: PlayerView;
  queue: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  songPopularity: Record<string, number>;
  playedHistory: string[];
  exclusionRules: ExclusionRule[];
  tasteProfile: any;
  smartMood: boolean;
  lyrics: string | null;
  loadingLyrics: boolean;
  setIsPlayerOpen: (open: boolean) => void;
  setPlayerView: (view: PlayerView) => void;
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
  addExclusionRule: (type: 'artist' | 'genre' | 'song', value: string) => void;
  removeExclusionRule: (ruleId: string) => void;
  setTasteProfile: (profile: any) => void;
  setSmartMood: (enabled: boolean) => void;
}

interface MusicProgressContextType {
  progress: number;
  duration: number;
  volume: number;
  totalListeningTime: number;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
}

const MusicStateContext = createContext<MusicStateContextType | undefined>(undefined);
const MusicProgressContext = createContext<MusicProgressContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerOpen, setIsPlayerOpenInternal] = useState(false);
  const [playerView, setPlayerViewState] = useState<PlayerView>('cover');
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
  const lastSavedTotalTimeRef = useRef(0);

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

  useEffect(() => {
    if (!audioRef.current) return;
    const handleEnded = () => nextTrack();
    audioRef.current.addEventListener('ended', handleEnded);
    return () => audioRef.current?.removeEventListener('ended', handleEnded);
  }, [queue, currentTrack, smartMood]);

  useEffect(() => {
    const savedLikes = localStorage.getItem('ayumusic_likes');
    if (savedLikes) try { setLikedSongs(JSON.parse(savedLikes)); } catch (e) {}

    const savedPlaylists = localStorage.getItem('ayumusic_playlists');
    if (savedPlaylists) try { setPlaylists(JSON.parse(savedPlaylists)); } catch (e) {}

    const savedVol = localStorage.getItem('ayumusic_volume');
    if (savedVol) setVolumeState(parseFloat(savedVol));

    const savedTime = localStorage.getItem('ayumusic_total_time');
    if (savedTime) {
      const time = parseInt(savedTime, 10);
      setTotalListeningTime(time);
      lastSavedTotalTimeRef.current = time;
    }

    const savedPopularity = localStorage.getItem('ayumusic_popularity');
    if (savedPopularity) try { setSongPopularity(JSON.parse(savedPopularity)); } catch (e) {}

    const savedHistory = localStorage.getItem('ayumusic_history');
    if (savedHistory) try { setPlayedHistory(JSON.parse(savedHistory)); } catch (e) {}

    const savedExclusions = localStorage.getItem('ayumusic_exclusions');
    if (savedExclusions) try { setExclusionRules(JSON.parse(savedExclusions)); } catch (e) {}

    const savedTaste = localStorage.getItem('ayumusic_taste');
    if (savedTaste) try { setTasteProfileState(JSON.parse(savedTaste)); } catch (e) {}

    const savedSmartMood = localStorage.getItem('ayumusic_smart_mood');
    if (savedSmartMood) setSmartMoodState(savedSmartMood === 'true');
  }, []);

  useEffect(() => {
    if (Math.abs(totalListeningTime - lastSavedTotalTimeRef.current) >= 10) {
      localStorage.setItem('ayumusic_total_time', totalListeningTime.toString());
      lastSavedTotalTimeRef.current = totalListeningTime;
    }
  }, [totalListeningTime]);

  useEffect(() => {
    localStorage.setItem('ayumusic_likes', JSON.stringify(likedSongs));
    localStorage.setItem('ayumusic_playlists', JSON.stringify(playlists));
    localStorage.setItem('ayumusic_popularity', JSON.stringify(songPopularity));
    localStorage.setItem('ayumusic_history', JSON.stringify(playedHistory));
    localStorage.setItem('ayumusic_exclusions', JSON.stringify(exclusionRules));
    localStorage.setItem('ayumusic_taste', JSON.stringify(tasteProfile));
    localStorage.setItem('ayumusic_smart_mood', smartMood.toString());
  }, [likedSongs, playlists, songPopularity, playedHistory, exclusionRules, tasteProfile, smartMood]);

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
      }).catch(() => setLoadingLyrics(false));
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const setIsPlayerOpen = useCallback((open: boolean) => {
    setIsPlayerOpenInternal(open);
    if (!open) setPlayerViewState('cover');
  }, []);

  const setPlayerView = useCallback((view: PlayerView) => {
    setPlayerViewState(view);
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
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

  const nextTrack = useCallback(async () => {
    if (!currentTrack) return;
    const currentIndex = queue.findIndex(s => s.id === currentTrack.id);
    if (currentIndex === queue.length - 1 && smartMood) {
      const moodSongs = await searchSongs(`${currentTrack.name} ${currentTrack.artists.primary[0].name}`);
      const newSongs = moodSongs.filter(s => !queue.find(q => q.id === s.id)).slice(0, 10);
      if (newSongs.length > 0) {
        setQueue(prev => [...prev, ...newSongs]);
        playTrack(newSongs[0]);
        return;
      }
    }
    if (queue.length > 0) playTrack(queue[(currentIndex + 1) % queue.length]);
  }, [currentTrack, queue, smartMood, playTrack]);

  const prevTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.id === currentTrack.id);
    playTrack(queue[(currentIndex - 1 + queue.length) % queue.length]);
  }, [currentTrack, queue, playTrack]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => setVolumeState(vol), []);
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
  const addExclusionRule = useCallback((type: any, value: string) => setExclusionRules(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type, value }]), []);
  const removeExclusionRule = useCallback((id: string) => setExclusionRules(prev => prev.filter(r => r.id !== id)), []);
  const setTasteProfile = useCallback((profile: any) => setTasteProfileState(profile), []);
  const setSmartMood = useCallback((enabled: boolean) => setSmartMoodState(enabled), []);

  const stateValue = useMemo(() => ({
    currentTrack, isPlaying, isPlayerOpen, playerView, queue, likedSongs, playlists, songPopularity, playedHistory, exclusionRules, tasteProfile, smartMood, lyrics, loadingLyrics,
    setIsPlayerOpen, setPlayerView, playTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked,
    createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist, recordSearchSelection, removeFromHistory, clearHistory, addExclusionRule, removeExclusionRule, setTasteProfile, setSmartMood
  }), [currentTrack, isPlaying, isPlayerOpen, playerView, queue, likedSongs, playlists, songPopularity, playedHistory, exclusionRules, tasteProfile, smartMood, lyrics, loadingLyrics, setIsPlayerOpen, setPlayerView, playTrack, stopTrack, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist, recordSearchSelection, removeFromHistory, clearHistory, addExclusionRule, removeExclusionRule, setTasteProfile, setSmartMood]);

  const progressValue = useMemo(() => ({
    progress, duration, volume, totalListeningTime, seek, setVolume
  }), [progress, duration, volume, totalListeningTime, seek, setVolume]);

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