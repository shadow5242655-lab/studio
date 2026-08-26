'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Song, searchSongs, getBestImage, decodeEntities, getTrending, formatDuration } from '@/lib/music-api';
import { 
  Heart, Play, Music2, Search, Loader2, Sparkles, Shuffle, Menu, Smartphone, ListFilter, Coffee, HeartIcon, Zap, Pause, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';

const VibeButton = ({ icon: Icon, label, query, onClick }: { icon: any, label: string, query: string, onClick: (q: string) => void }) => (
  <button 
    onClick={() => onClick(query)}
    className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] rounded-2xl border border-white/5 whitespace-nowrap hover:bg-white/10 transition-all active:scale-95 shrink-0"
  >
    <Icon className="h-4 w-4 text-primary" />
    <span className="text-xs font-black text-white uppercase tracking-tight italic">{label}</span>
  </button>
);

const HorizontalSection = ({ title, query, onPlayTrack }: { title: string, query: string, onPlayTrack: (song: Song, list: Song[]) => void }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchSongs = useCallback(async (p: number) => {
    setIsFetching(true);
    const data = await searchSongs(query, p);
    if (data.length === 0) {
      setHasMore(false);
    } else {
      setSongs(prev => p === 1 ? data : [...prev, ...data]);
    }
    setIsFetching(false);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchSongs(1);
  }, [fetchSongs]);

  const handleScroll = () => {
    if (!scrollRef.current || isFetching || !hasMore) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 200) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSongs(nextPage);
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
        <span className="text-[9px] font-black text-primary uppercase tracking-widest">Neural Resonance</span>
      </div>
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
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
        {isFetching && (
          <div className="flex-shrink-0 w-36 flex items-center justify-center">
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
        "Patar Bashori Coke Studio Bangla",
        "Dai Dai Burna Boy Shakira",
        "Dracula Tame Impala",
        "O Madhu Benny Dayal",
        "Bhalolaage Tomake Arijit Singh",
        "Keno Je Toke Raj Barman",
        "Under The Influence Chris Brown",
        "Señorita Shawn Mendes",
        "Sohniye Tu Original Zubeen Garg"
      ];
      
      try {
        const results = await Promise.all(queries.map(q => searchSongs(q, 1)));
        const flatSongs = results.map(res => res[0]).filter(Boolean);
        setSongs(flatSongs);
      } catch (e) {
        console.error("QuickPicks failed", e);
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
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Quick picks</h2>
        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest gap-2 bg-white/5 rounded-full px-4 h-8" onClick={() => onPlayTrack(songs[0], songs)}>
          <Play className="h-3 w-3 fill-current" /> Play all
        </Button>
      </div>
      <div className="space-y-4">
        {songs.map((song) => (
          <div 
            key={song.id}
            onClick={() => onPlayTrack(song, songs)}
            className="flex items-center gap-4 group cursor-pointer active:bg-white/5 p-2 rounded-2xl transition-colors hover:bg-[#1a1a1a]"
          >
            <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0 shadow-lg border border-white/5">
              <img src={getBestImage(song) || ''} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="h-5 w-5 text-white fill-current" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white truncate italic uppercase tracking-tight">{decodeEntities(song.name)}</p>
              <p className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest mt-1">
                {song.artists.primary.map(a => decodeEntities(a.name)).join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                className="p-1 text-neutral-600 hover:text-primary transition-colors"
              >
                <Heart className={cn("h-4 w-4", isLiked(song.id) && "fill-primary text-primary")} />
              </button>
              <span className="text-[10px] font-bold text-neutral-600 w-8 text-right">{formatDuration(song.duration)}</span>
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await getTrending();
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

  const handleVibeClick = async (vibe: string) => {
    setLoading(true);
    setIsSearching(true);
    try {
      const results = await searchSongs(vibe);
      setDisplaySongs(results);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) {
      if (isSearching) loadInitialData();
      setIsSearching(false);
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
  }, [searchQuery, isSearching, loadInitialData]);

  if (loading && !isSearching) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans animate-in fade-in duration-500 pb-52">
      
      {/* Top Header Branding */}
      <header className="px-6 py-5 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-xl z-[60]">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-full shadow-[0_0_15px_rgba(255,0,0,0.5)]">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter uppercase">AYUMUSIC</span>
        </div>
        <button className="p-2 text-neutral-400 hover:text-white transition-colors">
          <Menu className="h-7 w-7" />
        </button>
      </header>

      {/* Discovery Hub */}
      <div className="space-y-10">
        
        {/* Search Node */}
        <div className="px-6 flex items-center gap-3">
           <div className="bg-primary/20 p-2.5 rounded-2xl">
              <Music2 className="h-6 w-6 text-primary" />
           </div>
           <div className="flex-1 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
             <Input 
               placeholder="Search for sounds..." 
               className="pl-11 pr-4 bg-[#1a1a1a] border-none rounded-2xl h-14 focus-visible:ring-primary/40 text-sm shadow-inner"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-4 text-neutral-400">
              <Smartphone className="h-6 w-6" />
              <ListFilter className="h-6 w-6" />
           </div>
        </div>

        {!isSearching && (
          <>
            {/* Hero Card - RESOUND Style */}
            <div className="mx-6 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#121212] via-black to-black p-10 border border-white/5 shadow-2xl space-y-8 group">
              <div className="absolute top-0 right-0 p-10 text-white/5 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Music2 className="h-72 w-72" />
              </div>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-primary uppercase tracking-[0.3em] shadow-inner">
                 NO ADS • NO SIGN-UP
              </div>
              
              <div className="space-y-4 relative z-10">
                <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-[0.8] neon-glow">RESOUND</h1>
                <p className="text-lg font-bold text-neutral-400 leading-tight max-w-[280px]">
                  High-fidelity sound resonance straight from the source.
                </p>
              </div>

              <div className="flex gap-4 pt-4 relative z-10">
                <Button 
                  onClick={() => playTrack(displaySongs[0], displaySongs)}
                  className="rounded-full bg-primary text-white font-black uppercase italic tracking-tighter gap-3 h-14 px-10 shadow-[0_10px_40px_rgba(255,0,0,0.4)] hover:scale-105 active:scale-95 transition-transform text-lg"
                >
                  <Play className="h-5 w-5 fill-current" /> PLAY NOW
                </Button>
                <Button 
                  variant="secondary"
                  className="rounded-full bg-[#1a1a1a] border border-white/5 text-white font-black uppercase italic tracking-tighter gap-3 h-14 px-8 hover:bg-white/10 text-lg"
                >
                  <Shuffle className="h-5 w-5" /> SHUFFLE
                </Button>
              </div>
            </div>

            {/* Pick A Vibe Section - Moved Up */}
            <section className="space-y-5">
               <div className="flex items-center justify-between px-6">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">Pick A Vibe</h2>
                 <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Architectural Curation</span>
               </div>
               <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2">
                 <VibeButton icon={HeartIcon} label="Romance" query="Romantic Hits 2024" onClick={handleVibeClick} />
                 <VibeButton icon={Sparkles} label="Party" query="Top Party Dance Music" onClick={handleVibeClick} />
                 <VibeButton icon={Coffee} label="Lo-fi" query="Lo-fi Hip Hop Beats Relax" onClick={handleVibeClick} />
                 <VibeButton icon={Zap} label="Workout" query="High Energy Workout Motivation" onClick={handleVibeClick} />
                 <VibeButton icon={Smartphone} label="Driving" query="Late Night Drive Phonk" onClick={handleVibeClick} />
               </div>
            </section>

            {/* Quick Picks Vertical Section */}
            <QuickPicksVertical onPlayTrack={playTrack} />

            {/* Neural Categories - Horizontally Infinite */}
            <div className="space-y-12">
              <HorizontalSection title="Punjabi Resonance" query="Latest Punjabi Viral Hits 2024" onPlayTrack={playTrack} />
              <HorizontalSection title="Haryanvi Lineage" query="Latest Haryanvi Top Songs 2024" onPlayTrack={playTrack} />
              <HorizontalSection title="Bhojpuri Soul" query="Trending Bhojpuri Hit Music" onPlayTrack={playTrack} />
              <HorizontalSection title="Lofi Echoes" query="Relaxing Lofi Chill Resonance" onPlayTrack={playTrack} />
            </div>
          </>
        )}

        {/* Search Results / Daily Picks */}
        {isSearching && (
          <section className="space-y-8 pb-20">
            <div className="flex items-center justify-between px-6">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Resonance Found</h2>
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest gap-2 bg-white/5 rounded-full px-4 h-8" onClick={() => playTrack(displaySongs[0], displaySongs)}>
                <Play className="h-3 w-3 fill-current" /> Play all
              </Button>
            </div>
            
            <div className="space-y-4 px-6">
              {displaySongs.map((song, idx) => (
                <div 
                  key={`${song.id}-${idx}`}
                  onClick={() => playTrack(song, displaySongs)}
                  className="flex items-center justify-between p-5 bg-[#121212] rounded-[2rem] border border-white/5 transition-all active:scale-98 group cursor-pointer hover:border-primary/30 shadow-xl"
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden bg-neutral-900 shrink-0 relative border border-white/5 shadow-inner">
                      <img src={getBestImage(song) || ''} className="h-full w-full object-cover" alt="" />
                      {currentTrack?.id === song.id && (
                        <div className="absolute inset-0 bg-primary/30 flex items-center justify-center backdrop-blur-[2px]">
                          {isPlaying ? (
                            <div className="flex gap-0.5 items-end h-5">
                              <div className="w-1 bg-white animate-[bounce_0.6s_infinite_0s]" style={{ height: '60%' }} />
                              <div className="w-1 bg-white animate-[bounce_0.6s_infinite_0.2s]" style={{ height: '100%' }} />
                              <div className="w-1 bg-white animate-[bounce_0.6s_infinite_0.4s]" style={{ height: '40%' }} />
                            </div>
                          ) : (
                            <Pause className="h-5 w-5 text-white fill-current" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        "font-black text-base leading-tight italic uppercase tracking-tighter truncate", 
                        currentTrack?.id === song.id ? "text-primary" : "text-white"
                      )}>
                        {decodeEntities(song.name)}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate uppercase mt-1 font-black tracking-[0.2em]">
                        {song.artists.primary[0]?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                      className="p-2 text-neutral-700 hover:text-primary transition-all"
                    >
                      <Heart className={cn("h-6 w-6 transition-all", isLiked(song.id) && "fill-primary text-primary scale-110")} />
                    </button>
                    <MoreVertical className="h-5 w-5 text-neutral-800" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
