'use client';

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { Song, searchSongs, getBestImage, decodeEntities, getTrending } from '@/lib/music-api';
import { 
  Heart, Play, Music2, Search, Loader2, Sparkles, Shuffle, X, MoreHorizontal, Library, Compass, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const HorizontalSection = memo(({ 
  title, 
  songs, 
  type, 
  onPlayAll, 
  onPlayTrack, 
  onLoadMore, 
  loadingMore,
  currentTrackId
}: { 
  title: string, 
  songs: Song[], 
  type: string,
  onPlayAll: (songs: Song[]) => void,
  onPlayTrack: (song: Song, playlist: Song[]) => void,
  onLoadMore: (type: string) => void,
  loadingMore: boolean,
  currentTrackId?: string
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollLeft + target.clientWidth >= target.scrollWidth - 600) {
      onLoadMore(type);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">{title}</h2>
        <Button 
          variant="ghost" 
          className="text-[10px] font-black text-white bg-white/5 rounded-full px-4 h-8 uppercase tracking-widest gap-2 hover:bg-white/10"
          onClick={() => songs.length > 0 && onPlayAll(songs)}
        >
          <Play className="h-3 w-3 fill-current" /> Play all
        </Button>
      </div>
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 scroll-smooth"
      >
        {songs.map((song) => (
          <div 
            key={`${type}-${song.id}`}
            onClick={() => onPlayTrack(song, songs)}
            className="flex-shrink-0 w-36 md:w-48 lag-free-tap group cursor-pointer"
          >
            <div className="relative aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-neutral-900 border border-white/5 shadow-xl mb-3">
              <img 
                src={getBestImage(song) || ''} 
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt="" 
                loading="lazy"
              />
              {currentTrackId === song.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                </div>
              )}
            </div>
            <p className="font-bold text-[10px] md:text-sm text-white italic uppercase tracking-tight truncate px-1">
              {decodeEntities(song.name)}
            </p>
            <p className="text-[8px] md:text-[10px] text-neutral-500 uppercase font-black tracking-widest truncate px-1 mt-0.5">
              {song.artists.primary[0]?.name}
            </p>
          </div>
        ))}
        {loadingMore && (
          <div className="flex-shrink-0 w-36 md:w-48 aspect-square flex items-center justify-center bg-white/5 rounded-[1.5rem]">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}
      </div>
    </section>
  );
});

HorizontalSection.displayName = 'HorizontalSection';

export default function Home() {
  const { playTrack, toggleLike, isLiked, currentTrack, playRandomTrack } = useMusic();
  const router = useRouter();
  
  const [displaySongs, setDisplaySongs] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [regionalSongs, setRegionalSongs] = useState<Record<string, Song[]>>({
    punjabi: [], haryanvi: [], bhojpuri: [], lofi: []
  });
  const [pages, setPages] = useState<Record<string, number>>({
    punjabi: 1, haryanvi: 1, bhojpuri: 1, lofi: 1
  });

  const [loading, setLoading] = useState(true);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState<Record<string, boolean>>({});
  
  const [listTitle, setListTitle] = useState('Daily Picks');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) {
      if (isSearching) loadInitialData();
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      console.log('AYUMUSIC: Orchestrating high-fidelity initial lineage');
      const [barianResults, dailyResults, trending] = await Promise.all([
        searchSongs("Barian Bilal Saeed", 1),
        searchSongs("Latest Top Hits 2024 Bollywood", 1),
        getTrending(1)
      ]);
      
      // Filter out 'bonalu', 'mangli', and 'banali'
      const filteredDaily = dailyResults.filter(s => {
        const name = s.name.toLowerCase();
        const artist = (s.artists.primary[0]?.name || '').toLowerCase();
        return !name.includes('bonalu') && 
               !name.includes('mangli') && 
               !name.includes('banali') && 
               !artist.includes('mangli');
      });

      // Ensure 'Barian' is the primary resonance
      const barian = barianResults[0];
      const combinedDaily = barian 
        ? [barian, ...filteredDaily.filter(s => s.id !== barian.id)]
        : filteredDaily;

      setDisplaySongs(combinedDaily.slice(0, 10));
      setTrendingSongs(trending.slice(0, 10));

      searchSongs("Punjabi Top Hits 2024", 1).then(songs => 
        setRegionalSongs(prev => ({ ...prev, punjabi: songs }))
      );
      searchSongs("Haryanvi Latest Hits", 1).then(songs => 
        setRegionalSongs(prev => ({ ...prev, haryanvi: songs }))
      );
      searchSongs("Bhojpuri Superhits", 1).then(songs => 
        setRegionalSongs(prev => ({ ...prev, bhojpuri: songs }))
      );
      searchSongs("Lofi Hip Hop Chill", 1).then(songs => 
        setRegionalSongs(prev => ({ ...prev, lofi: songs }))
      );

      setListTitle('Daily Picks');
      setIsSearching(false);
    } catch (e) {
      console.error("AYUMUSIC: Initial load failed", e);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRegional = useCallback(async (type: string) => {
    if (loadingMore[type]) return;
    setLoadingMore(prev => ({ ...prev, [type]: true }));
    try {
      const nextPage = (pages[type] || 1) + 1;
      let query = "";
      switch (type) {
        case 'punjabi': query = "Punjabi Top Hits 2024"; break;
        case 'haryanvi': query = "Haryanvi Latest Hits"; break;
        case 'bhojpuri': query = "Bhojpuri Superhits"; break;
        case 'lofi': query = "Lofi Hip Hop Chill"; break;
      }
      const newSongs = await searchSongs(query, nextPage);
      if (newSongs.length > 0) {
        setRegionalSongs(prev => {
          const combined = [...(prev[type] || []), ...newSongs];
          const unique = Array.from(new Map(combined.map(s => [s.id, s])).values());
          return { ...prev, [type]: unique };
        });
        setPages(prev => ({ ...prev, [type]: nextPage }));
      }
    } catch (e) {
      console.error(`AYUMUSIC: Load more ${type} failed`, e);
    } finally {
      setLoadingMore(prev => ({ ...prev, [type]: false }));
    }
  }, [pages, loadingMore]);

  const performSearch = async (query: string) => {
    setVibeLoading(true);
    setIsSearching(true);
    setListTitle(`Results for "${query}"`);
    try {
      const results = await searchSongs(query);
      setDisplaySongs(results);
    } catch (e) {
      console.error("AYUMUSIC: Search failed", e);
    } finally {
      setVibeLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (displaySongs.length > 0) {
      console.log('AYUMUSIC: Play All triggered resonance with', displaySongs.length, 'tracks');
      playTrack(displaySongs[0], displaySongs);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen pb-48 w-full mx-auto font-sans text-white selection:bg-primary/30 animate-in fade-in duration-500 flex flex-col items-center">
      
      {/* Hardware-Stabilized Sticky Header */}
      <header className="w-full bg-[#0a0a0a]/95 backdrop-blur-xl sticky top-0 z-[100] border-b border-white/5">
        <div className="max-w-[480px] md:max-w-[768px] lg:max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-primary p-1.5 rounded-lg shadow-[0_0_10px_rgba(255,0,0,0.3)]">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-lg tracking-tighter text-white uppercase italic hidden xs:block">AYUMUSIC</span>
          </div>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
            <Input 
              ref={searchInputRef}
              placeholder="Search frequencies..." 
              className="pl-9 pr-8 bg-white/5 border-none text-sm h-10 rounded-full focus-visible:ring-primary/50 placeholder:text-neutral-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 text-neutral-500 hover:text-white rounded-full h-10 w-10 lag-free-tap"
              >
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1a1a1a] border-white/5 text-white w-52 p-2 shadow-2xl z-[110]" align="end">
              <DropdownMenuItem 
                className="cursor-pointer font-bold italic uppercase tracking-tighter p-3 rounded-xl hover:bg-white/10" 
                onSelect={() => {
                  searchInputRef.current?.focus();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Search className="mr-3 h-5 w-5 text-primary" /> Search
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer font-bold italic uppercase tracking-tighter p-3 rounded-xl hover:bg-white/10" onSelect={() => router.push('/library')}>
                <Library className="mr-3 h-5 w-5 text-neutral-400" /> My Library
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer font-bold italic uppercase tracking-tighter p-3 rounded-xl hover:bg-white/10" onSelect={() => router.push('/genres')}>
                <Compass className="mr-3 h-5 w-5 text-neutral-400" /> Genres
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer font-bold italic uppercase tracking-tighter p-3 rounded-xl hover:bg-white/10" onSelect={() => router.push('/insights')}>
                <History className="mr-3 h-5 w-5 text-neutral-400" /> Echoes
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 my-2" />
              <DropdownMenuItem className="cursor-pointer font-bold italic uppercase tracking-tighter text-primary p-3 rounded-xl hover:bg-primary/10" onSelect={() => playRandomTrack()}>
                <Shuffle className="mr-3 h-5 w-5" /> Shuffle All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1400px] px-6 md:px-10 py-8 space-y-12">
        {/* Hero Card */}
        {!isSearching && (
          <section className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-[#1e1e1e] to-black p-8 md:p-16 border border-white/5 shadow-2xl group min-h-[350px] md:min-h-[450px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-12 text-white/5 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <Music2 className="h-48 w-48 md:h-80 md:w-80" />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                <Sparkles className="h-3 w-3" />
                PREMIUM FREQUENCIES • 320 KBPS
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">AYUMUSIC</h1>
                <p className="text-sm md:text-lg font-medium text-neutral-400 leading-relaxed max-w-sm md:max-w-md">
                  High-fidelity sound resonance architected for the modern discovery journey.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  onClick={() => playRandomTrack()}
                  className="rounded-full bg-primary text-white hover:bg-primary/90 font-black uppercase italic tracking-tight gap-3 h-12 md:h-14 px-8 md:px-12 lag-free-tap shadow-2xl shadow-primary/20 text-sm md:text-lg"
                >
                  <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" /> Play Trending
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => playRandomTrack()}
                  className="rounded-full bg-[#1e1e1e] border border-white/5 text-white hover:bg-white/10 font-black uppercase italic tracking-tight gap-3 h-12 md:h-14 px-8 md:px-12 lag-free-tap text-sm md:text-lg"
                >
                  <Shuffle className="h-4 w-4 md:h-5 md:w-5" /> Shuffle
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Resonance List */}
        <section className="space-y-8 min-h-[400px]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-white">{listTitle}</h2>
            {vibeLoading ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <Button 
                variant="ghost" 
                className="text-[10px] font-black text-white bg-white/5 rounded-full px-6 h-10 uppercase tracking-widest gap-2 hover:bg-white/10 lag-free-tap"
                onClick={handlePlayAll}
              >
                <Play className="h-3 w-3 fill-current" /> Play all
              </Button>
            )}
          </div>
          
          <div className={cn(
            "grid gap-4 transition-opacity duration-300", 
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            vibeLoading && "opacity-50 pointer-events-none"
          )}>
            {displaySongs.length > 0 ? (
              displaySongs.map((song) => (
                <div 
                  key={`daily-${song.id}`}
                  onClick={() => {
                    console.log('AYUMUSIC: Tap interaction on Daily Pick track', song.id);
                    playTrack(song, displaySongs);
                  }}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-2xl md:rounded-[2rem] border border-white/5 lag-free-tap transition-all hover:bg-white/5 group cursor-pointer"
                >
                  <div className="flex items-center gap-4 md:gap-5 min-w-0">
                    <div className="h-14 w-14 md:h-16 md:w-16 rounded-xl md:rounded-2xl overflow-hidden bg-neutral-900 shrink-0 shadow-lg relative border border-white/5">
                      <img src={getBestImage(song) || ''} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" loading="lazy" />
                      {currentTrack?.id === song.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        "font-bold text-sm md:text-base leading-tight italic uppercase tracking-tight truncate", 
                        currentTrack?.id === song.id ? "text-primary" : "text-white"
                      )}>
                        {decodeEntities(song.name)}
                      </p>
                      <p className="text-[10px] md:text-[11px] text-neutral-500 truncate uppercase mt-1.5 font-black tracking-[0.15em]">
                        {song.artists.primary[0]?.name}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                    className="p-3 text-neutral-700 hover:text-primary transition-colors"
                  >
                    <Heart className={cn("h-5 w-5 md:h-6 md:w-6", isLiked(song.id) && "fill-primary text-primary")} />
                  </button>
                </div>
              ))
            ) : !vibeLoading && (
              <div className="col-span-full py-24 text-center opacity-40">
                <Search className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-6 text-neutral-800" />
                <p className="font-black italic uppercase tracking-tighter text-lg md:text-xl">No frequencies resolved</p>
              </div>
            )}
          </div>
        </section>

        {/* Trending Lineage */}
        {!isSearching && (
          <>
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-white">Trending Now</h2>
                <Button 
                  variant="ghost" 
                  className="text-[10px] font-black text-white bg-white/5 rounded-full px-6 h-10 uppercase tracking-widest gap-2 hover:bg-white/10 lag-free-tap"
                  onClick={() => trendingSongs.length > 0 && playTrack(trendingSongs[0], trendingSongs)}
                >
                  <Play className="h-3 w-3 fill-current" /> Play all
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trendingSongs.map((song, i) => (
                  <div 
                    key={`trending-${song.id}`} 
                    onClick={() => playTrack(song, trendingSongs)}
                    className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-2xl md:rounded-[2rem] border border-white/5 lag-free-tap transition-all hover:bg-white/5 group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 md:gap-5 min-w-0">
                      <span className="text-lg md:text-xl font-black italic text-neutral-800 group-hover:text-primary transition-colors shrink-0 w-6 md:w-8">{i + 1}</span>
                      <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl overflow-hidden bg-neutral-900 shrink-0 shadow-lg relative border border-white/5">
                        <img src={getBestImage(song) || ''} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" loading="lazy" />
                      </div>
                      <div className="min-w-0">
                        <p className={cn(
                          "font-bold text-sm md:text-base leading-tight italic uppercase tracking-tight truncate", 
                          currentTrack?.id === song.id ? "text-primary" : "text-white"
                        )}>
                          {decodeEntities(song.name)}
                        </p>
                        <p className="text-[10px] md:text-[11px] text-neutral-500 truncate uppercase mt-1.5 font-black tracking-[0.15em]">
                          {song.artists.primary[0]?.name}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                      className="p-3 text-neutral-700 hover:text-primary transition-colors"
                    >
                      <Heart className={cn("h-5 w-5 md:h-6 md:w-6", isLiked(song.id) && "fill-primary text-primary")} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <HorizontalSection 
              title="Punjabi Hits" songs={regionalSongs.punjabi} type="punjabi" 
              onPlayAll={(songs) => playTrack(songs[0], songs)} onPlayTrack={playTrack}
              onLoadMore={loadMoreRegional} loadingMore={loadingMore.punjabi} currentTrackId={currentTrack?.id}
            />
            <HorizontalSection 
              title="Haryanvi Heart" songs={regionalSongs.haryanvi} type="haryanvi" 
              onPlayAll={(songs) => playTrack(songs[0], songs)} onPlayTrack={playTrack}
              onLoadMore={loadMoreRegional} loadingMore={loadingMore.haryanvi} currentTrackId={currentTrack?.id}
            />
            <HorizontalSection 
              title="Bhojpuri Beats" songs={regionalSongs.bhojpuri} type="bhojpuri" 
              onPlayAll={(songs) => playTrack(songs[0], songs)} onPlayTrack={playTrack}
              onLoadMore={loadMoreRegional} loadingMore={loadingMore.bhojpuri} currentTrackId={currentTrack?.id}
            />
            <HorizontalSection 
              title="Lofi Resonance" songs={regionalSongs.lofi} type="lofi" 
              onPlayAll={(songs) => playTrack(songs[0], songs)} onPlayTrack={playTrack}
              onLoadMore={loadMoreRegional} loadingMore={loadingMore.lofi} currentTrackId={currentTrack?.id}
            />
          </>
        )}
      </main>
    </div>
  );
}
