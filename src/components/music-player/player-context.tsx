'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, getBestDownload, getTrending, decodeEntities, fetchAudiusMoodTracks, getLyrics, attachMood, searchSongs, getSongUrl } from '@/lib/music-api';
import { recordPlay, getTopArtists, getRecentlyPlayedIds, getRecentlyPlayedUrls, normalizeAudioUrl } from '@/lib/listening-history';
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

  // ==========================================================================
  // CORE PLAYBACK FUNCTION — auth_url is resolved FIRST
  // ==========================================================================
  // This is the single entry point for all song playback. It:
  // 1. Resolves the auth_url using getSongUrl() (explicit API fetch if needed)
  // 2. Normalizes the URL (strips http/https)
  // 3. Checks against recentlyPlayedUrls (PRIMARY) and recentlyPlayedIds (SECONDARY)
  // 4. If duplicate → skips and tries next song from queue
  // 5. If unique → plays it and records the URL
  // ==========================================================================
  const playTrackInternal = useCallback(async (track: Song, fromQueue?: Song[]) => {
    if (!track) return;
    const audio = audioRef.current;
    if (!audio) return;

    // STEP 1: Resolve the auth_url — this is the REAL audio URL
    const authUrl = await getSongUrl(track);
    const normalizedUrl = authUrl ? normalizeAudioUrl(authUrl) : '';

    // STEP 2: Load dedup lists from localStorage
    const recentlyPlayedIds = getRecentlyPlayedIds();
    const recentlyPlayedUrls = getRecentlyPlayedUrls();

    // STEP 3: Check for duplicates
    // PRIMARY: Is this normalized audio URL already played?
    const isDuplicateByUrl = normalizedUrl && recentlyPlayedUrls.includes(normalizedUrl);
    // SECONDARY: Is this song ID already played?
    const isDuplicateById = recentlyPlayedIds.includes(track.id);

    if (isDuplicateByUrl || isDuplicateById) {
      const reason = isDuplicateByUrl ? 'audio URL' : 'song ID';
      console.log(`🔄 AYUMUSIC: BLOCKED duplicate (${reason}):`, track.name, '| URL:', normalizedUrl || 'N/A', '| ID:', track.id);

      // Try to find a non-duplicate from the queue
      const searchQueue = fromQueue && fromQueue.length > 1 ? fromQueue : queueRef.current;
      if (searchQueue.length > 1) {
        const currentIdx = searchQueue.findIndex(s => s.id === track.id);
        for (let i = 1; i < searchQueue.length; i++) {
          const nextIdx = (currentIdx + i) % searchQueue.length;
          const candidate = searchQueue[nextIdx];
          // Resolve THIS candidate's URL too
          const candidateUrl = await getSongUrl(candidate);
          const candidateNorm = candidateUrl ? normalizeAudioUrl(candidateUrl) : '';
          const candidateIsDup =
            (candidateNorm && recentlyPlayedUrls.includes(candidateNorm)) ||
            recentlyPlayedIds.includes(candidate.id);
          if (!candidateIsDup) {
            console.log('▶️ AYUMUSIC: Switching to non-duplicate:', candidate.name, '| URL:', candidateNorm);
            playTrackInternal(candidate, fromQueue || searchQueue);
            return;
          }
        }
        console.log('⚠️ AYUMUSIC: All queue songs are duplicates. Playing requested song anyway.');
      } else {
        console.log('⚠️ AYUMUSIC: No alternative found. Playing:', track.name);
      }
    }

    // STEP 4: Resolve audio URL for playback
    if (!authUrl) {
      toast({ variant: "destructive", title: "Resonance Blocked", description: "Frequency unavailable." });
      return;
    }

    // STEP 5: Play the song
    audio.pause();
    audio.src = authUrl;
    audio.load();

    console.log('🎵 AYUMUSIC: Playing:', track.name, '| URL:', normalizedUrl, '| ID:', track.id);
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setIsBuffering(true);
    setProgress(0);

    if (fromQueue) {
      setQueue(fromQueue);
      queueRef.current = fromQueue;
    }
    
    setPlayedHistory(prev => [{ id: track.id, name: track.name, songData: track }, ...prev.filter(i => i.id !== track.id)].slice(0, 50));
    
    // STEP 6: Record play — saves both song ID AND audio URL to localStorage
    recordPlay(track, authUrl);
    
    audio.play().catch((err) => {
      console.warn('⚠️ AYUMUSIC: Playback interrupted', err);
      setIsBuffering(false);
    });

    // Spotify-style: Immediate Neural Buffer Fetch
    if (smartMood) {
      const mood = track.mood || 'pop';
      fetchAudiusMoodTracks(mood).then(res => {
        autoMixQueueRef.current = res;
        setAutoMixQueue(res);
        console.log(`📡 AYUMUSIC NEURAL: Buffered ${res.length} songs for "${mood}" mood.`);
      });
    }
  }, [smartMood]);

  // ==========================================================================
  // AUTO-RECOMMENDATION — resolves URLs before picking next song
  // ==========================================================================
  const startAutoRecommendation = useCallback(async () => {
    const lastSong = currentTrackRef.current;
    const mood = lastSong?.mood || 'pop';
    
    console.log('🔄 AYUMUSIC: Queue finished. Starting infinite autoplay for mood:', mood);

    const recentlyPlayedIds = getRecentlyPlayedIds();
    const recentlyPlayedUrls = getRecentlyPlayedUrls();

    // Resolve a song's URL and check if it's a duplicate
    const resolveAndCheck = async (s: Song): Promise<boolean> => {
      const url = await getSongUrl(s);
      const norm = url ? normalizeAudioUrl(url) : '';
      return (norm && recentlyPlayedUrls.includes(norm)) || recentlyPlayedIds.includes(s.id);
    };

    // Pick the first non-duplicate from a list (resolves URLs)
    const pickFresh = async (list: Song[]): Promise<Song | null> => {
      for (const s of list) {
        if (!(await resolveAndCheck(s))) return s;
      }
      return list.length > 0 ? list[0] : null;
    };

    // 1. Use Neural Buffer
    if (autoMixQueueRef.current.length > 0) {
      const nextBatch = [...autoMixQueueRef.current];
      const freshSong = await pickFresh(nextBatch);
      if (freshSong) {
        const remaining = nextBatch.filter(s => s.id !== freshSong.id);
        console.log('✅ AYUMUSIC: Auto-Mix Queue:', freshSong.name);
        queueRef.current = [freshSong, ...remaining];
        setQueue([freshSong, ...remaining]);
        autoMixQueueRef.current = remaining;
        setAutoMixQueue(remaining);
        playTrackInternal(freshSong);
      }
      return;
    }

    // 2. Fresh Neural Discovery
    try {
      console.log('📡 AYUMUSIC: Buffer empty. Fetching fresh resonance...');
      const resonance = await fetchAudiusMoodTracks(mood);
      // Filter out duplicates by resolving URLs
      const freshResonance: Song[] = [];
      for (const s of resonance) {
        if (!(await resolveAndCheck(s))) freshResonance.push(s);
      }
      const pool = freshResonance.length > 0 ? freshResonance : resonance;
      if (pool.length > 0) {
        const nextSong = pool[0];
        const remaining = pool.slice(1);
        queueRef.current = [nextSong, ...remaining];
        setQueue([nextSong, ...remaining]);
        console.log('✅ AYUMUSIC: Fresh resonance:', nextSong.name);
        playTrackInternal(nextSong);
      } else {
        // 3. Fallback to Trending
        console.log('⚠️ AYUMUSIC: Mood exhausted. Falling back to trending.');
        const trending = await getTrending();
        const freshTrending: Song[] = [];
        for (const s of trending) {
          if (!(await resolveAndCheck(s))) freshTrending.push(s);
        }
        const trendingPool = freshTrending.length > 0 ? freshTrending : trending;
        if (trendingPool.length > 0) {
          const nextSong = trendingPool[0];
          queueRef.current = [nextSong, ...trendingPool.slice(1)];
          setQueue([nextSong, ...trendingPool.slice(1)]);
          playTrackInternal(nextSong);
        }
      }
    } catch (e) {
      console.error('❌ AYUMUSIC: Autoplay fetch failed', e);
    }
  }, [playTrackInternal]);

  const nextTrackInternal = useCallback(() => {
    const currentQueue = queueRef.current;
    const currentSong = currentTrackRef.current;
    
    console.log('⏹️ AYUMUSIC: Song ended.');

    // Case 1: Active queue has more songs
    if (currentQueue.length > 0) {
      const currentIdx = currentQueue.findIndex(s => s.id === currentSong?.id);
      if (currentIdx !== -1 && currentIdx < currentQueue.length - 1) {
        const nextSong = currentQueue[currentIdx + 1];
        console.log('▶️ AYUMUSIC: Next in queue:', nextSong.name);
        playTrackInternal(nextSong);
        return;
      }
    }

    // Case 2: Queue exhausted → Recursive Neural Autoplay
    if (smartMood) {
      startAutoRecommendation();
    } else {
      setIsPlaying(false);
      console.log('⏹️ AYUMUSIC: Playback stopped (Smart Mood Disabled)');
    }
  }, [playTrackInternal, startAutoRecommendation, smartMood]);

  // ==========================================================================
  // INFINITY AUTO-PLAY — resolves URLs before selecting next song
  // ==========================================================================
  const fetchRecommendedSongs = useCallback(async (): Promise<Song[]> => {
    const topArtists = getTopArtists(2);
    const currentSong = currentTrackRef.current;
    const recentIds = getRecentlyPlayedIds();
    const recentUrls = getRecentlyPlayedUrls();

    // Deduplicate by resolving each song's URL and checking against played URLs
    const dedupeAndFilter = async (songs: Song[]): Promise<Song[]> => {
      const seenIds = new Set<string>();
      const seenUrls = new Set<string>();
      const result: Song[] = [];
      for (const s of songs) {
        if (!s?.id) continue;
        if (seenIds.has(s.id) || recentIds.includes(s.id)) continue;
        const url = await getSongUrl(s);
        const norm = url ? normalizeAudioUrl(url) : '';
        if (norm && (seenUrls.has(norm) || recentUrls.includes(norm))) continue;
        seenIds.add(s.id);
        if (norm) seenUrls.add(norm);
        result.push(s);
      }
      return result;
    };

    // 1. Top favorite artist(s)
    for (const { artist } of topArtists) {
      try {
        const results = await searchSongs(`${artist} songs`, 1);
        const filtered = await dedupeAndFilter(results);
        if (filtered.length > 0) return filtered;
      } catch (e) {
        console.warn('AYUMUSIC: recommendation fetch failed for', artist, e);
      }
    }

    // 2. Fallback: current song's artist
    const currentArtist = currentSong?.artists?.primary?.[0]?.name;
    if (currentArtist) {
      try {
        const results = await searchSongs(`${currentArtist} songs`, 1);
        const filtered = await dedupeAndFilter(results);
        if (filtered.length > 0) return filtered;
      } catch (e) {
        console.warn('AYUMUSIC: current-artist recommendation failed', e);
      }
    }

    // 3. Final fallback: generic top hits
    try {
      const trending = await getTrending();
      const filtered = await dedupeAndFilter(trending);
      if (filtered.length > 0) return filtered;
    } catch (e) {
      console.warn('AYUMUSIC: trending fallback failed', e);
    }

    return [];
  }, []);

  const infinityAutoPlay = useCallback(async () => {
    const currentSong = currentTrackRef.current;
    const recentIds = getRecentlyPlayedIds();
    const recentUrls = getRecentlyPlayedUrls();
    const candidates = await fetchRecommendedSongs();

    // Filter by resolved URLs
    const fresh: Song[] = [];
    for (const s of candidates) {
      if (s.id === currentSong?.id) continue;
      if (recentIds.includes(s.id)) continue;
      const url = await getSongUrl(s);
      const norm = url ? normalizeAudioUrl(url) : '';
      if (norm && recentUrls.includes(norm)) continue;
      fresh.push(s);
    }
    const pool = fresh.length > 0 ? fresh : candidates.filter(s => s.id !== currentSong?.id);

    if (pool.length === 0) {
      console.log('⏹️ AYUMUSIC: No more recommendations available.');
      toast({ variant: "destructive", title: "No more recommendations available." });
      setIsPlaying(false);
      return;
    }

    const nextSong = pool[Math.floor(Math.random() * pool.length)];
    console.log('🔀 AYUMUSIC: Infinity Auto-Play ->', nextSong.name);
    playTrackInternal(nextSong);
  }, [fetchRecommendedSongs, playTrackInternal]);

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
        infinityAutoPlay();
      };
      
      // Expose globally for debugging
      (window as any).ayumusic = {
        getQueue: () => queueRef.current,
        getCurrent: () => currentTrackRef.current,
        skip: nextTrackInternal
      };
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [infinityAutoPlay]);

  useEffect(() => {
    if (currentTrack) {
      setLoadingLyrics(true);
      getLyrics(currentTrack).then(res => {
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
