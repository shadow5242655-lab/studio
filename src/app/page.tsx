
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Song, searchSongs, getBestImage, decodeEntities, getTrending } from '@/lib/music-api';
import { 
  Heart, Play, Music2, Search, Loader2, Sparkles, Shuffle, Menu, Smartphone, ListFilter, Coffee, Zap, Pause, MoreVertical, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';

const VibeButton = ({ icon: Icon, label, query, onClick }: { icon: any, label: string, query: string, onClick: (q: string) => void }) => (
  <button 
    onClick={() => onClick(query)}
    className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] rounded-2xl border border-white/5 whitespace-nowrap hover:bg-white/10 transition-all active:scale-95 shrink-0"
  >
    <Icon className="h-3.5 w-3.5 text-primary" />
    <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-tight italic">{label}</span>
  </button>
);

const HorizontalSection = ({ title, query, onPlayTrack }: { title: string, query: string, onPlayTrack: (song: Song, list: Song[]) => void }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);
  const [isFetchingState, setIsFetchingState] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchNextPage = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;
    
    const nextPage = page + 1;
    isFetchingRef.current = true;
    setIsFetchingState(true);
    
    try {
      const data = await searchSongs(query, nextPage);
      if (!data || data.length === 0) {
        setHasMore(false);
      } else {
        setSongs(prev => {
          const combined = [...prev, ...data];
          const uniqueMap = new Map();
          combined.forEach(s => uniqueMap.set(s.id, s));
          return Array.from(uniqueMap.values());
        });
        setPage(nextPage);
      }
    } catch (e) {
      console.error("AYUMUSIC: Resonance fetch failed", e);
    } finally {
      isFetchingRef.current = false;
      setIsFetchingState(false);
    }
  }, [query, page, hasMore]);

  useEffect(() => {
    let mounted = true;
    setSongs([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    isFetchingRef.current = true;
    
    searchSongs(query, 1).then(data => {
      if (mounted) {
        setSongs(data);
        setLoading(false);
        isFetchingRef.current = false;
      }
    });
    return () => { mounted = false; };
  }, [query]);

  const onScroll = () => {
    if (!scrollRef.current || isFetchingRef.current || !hasMore) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 400) {
      fetchNextPage();
    }
  };

  if (loading && page === 1) {
    return (
      <div className="px-6 py-4 space-y-4">
        <div className="h-6 w-32 bg-neutral-900 animate-pulse rounded" />
        <div className="flex gap-4 overflow-hidden">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-36 h-48 bg-neutral-900 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-6">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">{title}</h2>
      </div>
      <div 
        ref={scrollRef}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4 scroll-smooth"
      >
        {songs.map((song, idx) => (
          <div 
            key={`${song.id}-${idx}`} 
            className="flex-shrink-0 w-36 group cursor-pointer"
            onClick={() => onPlayTrack(song, songs)}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 mb-2 shadow-lg">
              <img 
                src={getBestImage(song) || ''} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="h-8 w-8 text-white fill-current" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-white truncate uppercase italic tracking-tight">{decodeEntities(song.name)}</p>
            <p className="text-[8px] text-neutral-500 truncate uppercase font-black tracking-widest">{song.artists.primary[0]?.name}</p>
          </div>
        ))}
        {isFetchingState && (
          <div className="flex-shrink-0 w-36 flex items-center justify-center h-36">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}
      </div>
    </section>
  );
};

const QuickPicksVertical = ({ onPlayTrack }: { onPlayTrack: (song: Song, list: Song[]) => void }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleLike, isLiked } = useMusic();

  useEffect(() => {
    async function fetchQuickPicks() {
      const queries = [
        "Patar Bashori",
        "Dai Dai",
        "Dracula Tame Impala",
        "O Madhu Benny Dayal",
        "Bhalolaage Tomake",
        "Keno Je Toke",
        "Under The Influence Chris Brown",
        "Señorita Shawn Mendes",
        "Sohniye Tu Original Zubeen Garg"
      ];
      
      try {
        const results = await Promise.all(queries.map(q => searchSongs(q, 1)));
        const flatSongs = results.map(res => res[0]).filter(Boolean);
        setSongs(flatSongs);
      } catch (e) {
        console.error("AYUMUSIC: QuickPicks failed", e);
      } finally {
        setLoading(false);
      }
    }
    fetchQuickPicks();
  }, []);

  if (loading) {
    return (
      <div className="px-6 space-y-4">
        <div className="h-6 w-32 bg-neutral-900 animate-pulse rounded" />
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-20 bg-neutral-900 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-6 px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Daily Picks</h2>
        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest gap-2 bg-white/5 rounded-full px-4 h-8" onClick={() => onPlayTrack(songs[0], songs)}>
          <Play className="h-3 w-3 fill-current" /> Play all
        </Button>
      </div>
      <div className="space-y-3">
        {songs.map((song) => (
          <div 
            key={song.id}
            onClick={() => onPlayTrack(song, songs)}
            className="flex items-center gap-4 group cursor-pointer active:bg-white/5 p-3 rounded-2xl transition-colors bg-[#121212] border border-white/5"
          >
            <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 shadow-lg border border-white/5">
              <img src={getBestImage(song) || ''} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="h-5 w-5 text-white fill-current" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white truncate italic uppercase tracking-tight">{decodeEntities(song.name)}</p>
              <p className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest mt-1">
                {song.artists.primary[0]?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                className="p-1 text-neutral-600 hover:text-primary transition-colors"
              >
                <Heart className={cn("h-4 w-4", isLiked(song.id) && "fill-primary text-primary")} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function Home() {
  const { playTrack, toggleLike, isLiked, currentTrack, isPlaying } = useMusic();
  const [displaySongs, setDisplaySongs] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await getTrending();
      setTrendingSongs(results.slice(0, 15));
      setDisplaySongs(results.slice(0, 15));
    } catch (e) {
      console.error("AYUMUSIC: Load failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleVibeClick = useCallback((vibe: string) => {
    setSearchQuery(vibe);
  }, []);

  const handleShuffle = () => {
    const listToShuffle = isSearching ? displaySongs : trendingSongs;
    if (listToShuffle.length > 0) {
      const shuffled = [...listToShuffle].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setDisplaySongs(trendingSongs);
  };

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) {
      if (isSearching) clearSearch();
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setIsSearching(true);
      const results = await searchSongs(searchQuery);
      setDisplaySongs(results);
      setLoading(false);
    }, 500);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, isSearching]);

  if (loading && !isSearching && trendingSongs.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans animate-in fade-in duration-500">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-black z-[60]">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 flex items-center justify-center rounded-full bg-primary border border-white/5 overflow-hidden shadow-[0_0_15px_rgba(255,0,0,0.5)]">
            <Music2 className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none">AYUMUSIC</span>
        </div>
        <button className="p-2 text-white hover:text-primary transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <div className="space-y-6 pt-2 pb-44">
        <div className="px-6 flex items-center gap-3">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
             <Input 
               placeholder="Search for sounds..." 
               className="pl-12 pr-10 bg-[#1a1a1a] border-none rounded-2xl h-11 md:h-12 focus-visible:ring-primary/40 text-sm placeholder:text-neutral-600 shadow-xl"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             {searchQuery && (
               <button 
                 onClick={clearSearch}
                 className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-white"
               >
                 <X className="h-4 w-4" />
               </button>
             )}
           </div>
           <div className="flex items-center gap-2 text-neutral-400">
             <Smartphone className="h-5 w-5" />
             <ListFilter className="h-5 w-5" />
           </div>
        </div>

        {!isSearching && (
          <>
            <div className="mx-4 md:mx-6 relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#0c0c0c] p-6 md:p-12 border border-white/5 shadow-2xl flex flex-col group min-h-[280px] md:min-h-[320px] items-center text-center">
              {/* Neural Note Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Music2 className="h-[240px] w-[240px] md:h-[280px] md:w-[280px]" />
              </div>
              
              {/* Badge Pill */}
              <div className="w-full flex justify-center mb-4 md:mb-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md">
                   <span className="text-[9px] md:text-[10px] font-black text-[#e11d48] uppercase tracking-[0.2em] md:tracking-[0.3em]">
                     NO ADS • NO SIGN-UP
                   </span>
                </div>
              </div>
              
              {/* Hero Metadata */}
              <div className="flex-1 flex flex-col justify-center items-center relative z-10 space-y-3 md:space-y-4">
                <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-white">
                  AYUMUSIC
                </h1>
                <p className="text-xs md:text-lg font-medium text-neutral-400 max-w-lg leading-snug">
                  High-fidelity sound resonance straight from the source. Millions of tracks in <span className="text-[#e11d48] font-bold">320 kbps</span>.
                </p>
              </div>

              {/* Action Stack */}
              <div className="w-full flex flex-row items-center justify-center gap-2 md:gap-4 mt-8 md:mt-10 relative z-10">
                <button 
                  onClick={() => trendingSongs.length > 0 && playTrack(trendingSongs[0], trendingSongs)}
                  className="rounded-full bg-[#e11d48] text-white font-black uppercase italic tracking-tighter gap-2 md:gap-3 h-11 md:h-14 px-5 md:px-8 shadow-[0_10px_30px_rgba(225,29,72,0.3)] hover:scale-105 active:scale-95 transition-all text-[10px] md:text-xs flex items-center"
                >
                  <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" /> PLAY TRENDING
                </button>
                <button 
                  onClick={handleShuffle}
                  className="rounded-full bg-neutral-800/80 text-white font-black uppercase italic tracking-tighter gap-2 md:gap-3 h-11 md:h-14 px-5 md:px-8 border border-white/5 backdrop-blur-sm hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all text-[10px] md:text-xs flex items-center"
                >
                  <Shuffle className="h-4 w-4 md:h-5 md:w-5" /> SHUFFLE
                </button>
              </div>
            </div>

            <section className="space-y-4 pt-4">
               <div className="flex items-center justify-between px-6">
                 <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">Pick A Vibe</h2>
               </div>
               <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar px-6 pb-2">
                 <VibeButton icon={Heart} label="Romance" query="Romantic Hits 2024" onClick={handleVibeClick} />
                 <VibeButton icon={Sparkles} label="Party" query="Top Party Dance Music" onClick={handleVibeClick} />
                 <VibeButton icon={Coffee} label="Lo-fi" query="Lo-fi Hip Hop Beats Relax" onClick={handleVibeClick} />
                 <VibeButton icon={Zap} label="Workout" query="High Energy Workout Motivation" onClick={handleVibeClick} />
               </div>
            </section>

            <QuickPicksVertical onPlayTrack={playTrack} />

            <div className="space-y-10 md:space-y-12 mt-6 md:mt-8">
              <HorizontalSection title="Punjabi Songs" query="Latest Punjabi Viral Hits 2024" onPlayTrack={playTrack} />
              <HorizontalSection title="Haryanvi Songs" query="Latest Haryanvi Top Songs 2024" onPlayTrack={playTrack} />
              <HorizontalSection title="Bhojpuri Songs" query="Trending Bhojpuri Hit Music" onPlayTrack={playTrack} />
              <HorizontalSection title="Lofi Songs" query="Relaxing Lofi Chill Resonance" onPlayTrack={playTrack} />
            </div>
          </>
        )}

        {isSearching && (
          <section className="space-y-8 pb-20">
            <div className="flex items-center justify-between px-6">
              <div className="flex flex-col">
                <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest">Resonance Found</span>
                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter truncate max-w-[200px]">"{searchQuery}"</h2>
              </div>
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest gap-2 bg-white/5 rounded-full px-4 h-8" onClick={() => displaySongs.length > 0 && playTrack(displaySongs[0], displaySongs)}>
                <Play className="h-3 w-3 fill-current" /> Play all
              </Button>
            </div>
            
            <div className="space-y-3 md:space-y-4 px-6">
              {displaySongs.length > 0 ? (
                displaySongs.map((song, idx) => (
                  <div 
                    key={`${song.id}-${idx}`}
                    onClick={() => playTrack(song, displaySongs)}
                    className="flex items-center justify-between p-3 md:p-4 bg-[#121212] rounded-[1.2rem] md:rounded-[1.5rem] border border-white/5 transition-all active:scale-98 group cursor-pointer hover:border-primary/30 shadow-xl"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 relative border border-white/5 shadow-inner">
                        <img src={getBestImage(song) || ''} className="h-full w-full object-cover" alt="" />
                        {currentTrack?.id === song.id && (
                          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center backdrop-blur-[2px]">
                            {isPlaying ? (
                              <div className="flex gap-0.5 items-end h-3.5 md:h-4">
                                <div className="w-0.5 md:w-1 bg-white animate-[bounce_0.6s_infinite_0s]" style={{ height: '60%' }} />
                                <div className="w-0.5 md:w-1 bg-white animate-[bounce_0.6s_infinite_0.2s]" style={{ height: '100%' }} />
                                <div className="w-0.5 md:w-1 bg-white animate-[bounce_0.6s_infinite_0.4s]" style={{ height: '40%' }} />
                              </div>
                            ) : (
                              <Pause className="h-4 w-4 text-white fill-current" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={cn(
                          "font-black text-xs md:text-sm leading-tight italic uppercase tracking-tighter truncate", 
                          currentTrack?.id === song.id ? "text-primary" : "text-white"
                        )}>
                          {decodeEntities(song.name)}
                        </p>
                        <p className="text-[9px] md:text-[10px] text-neutral-500 truncate uppercase mt-0.5 font-black tracking-[0.1em] md:tracking-[0.15em]">
                          {song.artists.primary[0]?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                        className="p-1.5 md:p-2 text-neutral-700 hover:text-primary transition-all"
                      >
                        <Heart className={cn("h-4 w-4 md:h-5 md:w-5 transition-all", isLiked(song.id) && "fill-primary text-primary scale-110")} />
                      </button>
                      <MoreVertical className="h-4 w-4 md:h-5 md:w-5 text-neutral-800" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center opacity-40">
                  <Music2 className="h-10 w-10 mx-auto mb-3 text-neutral-700" />
                  <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest italic">No frequencies matching your vibration.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
