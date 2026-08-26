'use client';

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { Song, searchSongs, getBestImage, decodeEntities, getTrending } from '@/lib/music-api';
import { 
  Heart, Play, Music2, Search, Loader2, Smartphone, Settings2, Sparkles, Shuffle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';

// Hardware-stabilized Horizontal Section to prevent scroll resets
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
  onLoadMore: (type: any) => void,
  loadingMore: boolean,
  currentTrackId?: string
}) => {
  const startPos = useRef<{ x: number, y: number, time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (callback: () => void) => (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    const dt = Date.now() - startPos.current.time;
    if (dx < 10 && dy < 10 && dt < 300) {
      callback();
    }
    startPos.current = null;
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollLeft + target.clientWidth >= target.scrollWidth - 400) {
      onLoadMore(type);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">{title}</h2>
        <Button 
          variant="ghost" 
          className="text-[10px] font-black text-white bg-white/5 rounded-full px-4 h-8 uppercase tracking-widest gap-2 hover:bg-white/10"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp(() => songs.length > 0 && onPlayAll(songs))}
        >
          <Play className="h-3 w-3 fill-current" /> Play all
        </Button>
      </div>
      <div 
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 scroll-smooth"
      >
        {songs.map((song) => (
          <div 
            key={`${type}-${song.id}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(() => onPlayTrack(song, songs))}
            className="flex-shrink-0 w-36 md:w-44 lag-free-tap group cursor-pointer"
          >
            <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-neutral-900 border border-white/5 shadow-xl mb-3">
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
            <p className="font-bold text-[10px] md:text-xs text-white italic uppercase tracking-tight truncate px-1">
              {decodeEntities(song.name)}
            </p>
            <p className="text-[8px] md:text-[9px] text-neutral-500 uppercase font-black tracking-widest truncate px-1 mt-0.5">
              {song.artists.primary[0]?.name}
            </p>
          </div>
        ))}
        {loadingMore && (
          <div className="flex-shrink-0 w-36 md:w-44 aspect-square flex items-center justify-center bg-white/5 rounded-[1.5rem]">
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
  
  const [displaySongs, setDisplaySongs] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  
  const [punjabiSongs, setPunjabiSongs] = useState<Song[]>([]);
  const [haryanviSongs, setHaryanviSongs] = useState<Song[]>([]);
  const [bhojpuriSongs, setBhojpuriSongs] = useState<Song[]>([]);
  const [lofiSongs, setLofiSongs] = useState<Song[]>([]);

  const [pages, setPages] = useState<Record<string, number>>({
    punjabi: 1, haryanvi: 1, bhojpuri: 1, lofi: 1
  });

  const [loading, setLoading] = useState(true);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState<Record<string, boolean>>({});
  
  const [listTitle, setListTitle] = useState('Daily Picks');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  
  const startPos = useRef<{ x: number, y: number, time: number } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  async function loadInitialData() {
    setLoading(true);
    try {
      const dailyTerms = ["Bairan Banjaare", "Fortuner Raj Mawar", "Kabze Bintu Pabra", "Mithe Tere Bol Pari Masoom", "80 Lakh D Naveen"];
      const dailyResults = await Promise.all(dailyTerms.map(t => searchSongs(t).then(r => r[0])));
      setDisplaySongs(dailyResults.filter(Boolean));

      const trending = await getTrending();
      setTrendingSongs(trending.slice(0, 10));

      const [punjabi, haryanvi, bhojpuri, lofi] = await Promise.all([
        searchSongs("Punjabi Top Hits 2024", 1),
        searchSongs("Haryanvi Latest Hits", 1),
        searchSongs("Bhojpuri Superhits", 1),
        searchSongs("Lofi Hip Hop Chill", 1)
      ]);

      setPunjabiSongs(punjabi);
      setHaryanviSongs(haryanvi);
      setBhojpuriSongs(bhojpuri);
      setLofiSongs(lofi);

      setListTitle('Daily Picks');
      setIsSearching(false);
      setActiveVibe(null);
    } catch (e) {
      console.error("Initial load failed", e);
    } finally {
      setLoading(false);
    }
  }

  const handleVibeClick = async (vibeName: string) => {
    setVibeLoading(true);
    setIsSearching(false);
    setListTitle(`${vibeName} Resonance`);
    setSearchQuery('');
    setActiveVibe(vibeName);
    try {
      const results = await searchSongs(vibeName);
      setDisplaySongs(results.slice(0, 10));
    } catch (e) {
      console.error("Vibe fetch failed", e);
    } finally {
      setVibeLoading(false);
    }
  };

  const loadMoreRegional = useCallback(async (type: 'punjabi' | 'haryanvi' | 'bhojpuri' | 'lofi') => {
    if (loadingMore[type]) return;
    setLoadingMore(prev => ({ ...prev, [type]: true }));
    try {
      const nextPage = (pages[type] || 1) + 1;
      let query = "";
      let setter: any = null;
      switch (type) {
        case 'punjabi': query = "Punjabi Top Hits 2024"; setter = setPunjabiSongs; break;
        case 'haryanvi': query = "Haryanvi Latest Hits"; setter = setHaryanviSongs; break;
        case 'bhojpuri': query = "Bhojpuri Superhits"; setter = setBhojpuriSongs; break;
        case 'lofi': query = "Lofi Hip Hop Chill"; setter = setLofiSongs; break;
      }
      const newSongs = await searchSongs(query, nextPage);
      if (newSongs.length > 0) {
        setter((prev: Song[]) => {
          const combined = [...prev, ...newSongs];
          // Deduplicate
          return Array.from(new Map(combined.map(s => [s.id, s])).values());
        });
        setPages(prev => ({ ...prev, [type]: nextPage }));
      }
    } catch (e) {
      console.error(`Load more ${type} failed`, e);
    } finally {
      setLoadingMore(prev => ({ ...prev, [type]: false }));
    }
  }, [pages, loadingMore]);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (callback: () => void) => (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    const dt = Date.now() - startPos.current.time;
    if (dx < 10 && dy < 10 && dt < 300) {
      callback();
    }
    startPos.current = null;
  };

  const performSearch = async (query: string) => {
    setVibeLoading(true);
    setIsSearching(true);
    setListTitle(`Results for "${query}"`);
    setActiveVibe(null);
    try {
      const results = await searchSongs(query);
      setDisplaySongs(results);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setVibeLoading(false);
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
    <div className="bg-[#0a0a0a] min-h-screen pb-48 w-full max-w-7xl mx-auto md:px-8 font-sans text-white selection:bg-primary/30 animate-in fade-in duration-700">
      <main className="p-6 md:p-8 space-y-12">
        {/* Search & Meta Section */}
        <section className="flex items-center gap-4 bg-[#1a1a1a] p-2 rounded-[2rem] border border-white/5 shadow-2xl">
          <Music2 className="h-6 w-6 text-primary shrink-0 ml-4" />
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
            <Input 
              placeholder="Search for frequencies..." 
              className="pl-11 pr-10 bg-transparent border-none text-base h-12 focus-visible:ring-0 placeholder:text-neutral-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="hidden sm:flex gap-6 shrink-0 mr-6">
            <Smartphone className="h-5 w-5 text-neutral-500 hover:text-white transition-colors cursor-pointer" />
            <Settings2 className="h-5 w-5 text-neutral-500 hover:text-white transition-colors cursor-pointer" />
          </div>
        </section>

        {/* Vibe Chips */}
        <section className="space-y-6">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Pick a Vibe</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {[
              { name: 'Romance', icon: Heart },
              { name: 'Party', icon: Sparkles },
              { name: 'Lo-fi', icon: Music2 },
              { name: 'Workout', icon: Shuffle }
            ].map((vibe) => (
              <Button 
                key={vibe.name}
                variant="secondary" 
                className={cn(
                  "rounded-2xl bg-[#1e1e1e] border border-white/5 px-8 h-12 text-xs font-black uppercase tracking-widest shrink-0 lag-free-tap hover:bg-primary/20 gap-2 transition-all",
                  activeVibe === vibe.name && "ring-2 ring-primary bg-primary/10 text-primary"
                )}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp(() => handleVibeClick(vibe.name))}
              >
                <vibe.icon className={cn("h-4 w-4", activeVibe === vibe.name ? "text-primary" : "text-neutral-500")} />
                {vibe.name}
              </Button>
            ))}
          </div>
        </section>

        {/* Hero Card */}
        {!isSearching && (
          <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#1e1e1e] to-black p-10 md:p-16 border border-white/5 shadow-2xl group min-h-[400px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-12 text-white/5 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <Music2 className="h-64 w-64" />
            </div>
            
            <div className="relative z-10 space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                <Sparkles className="h-3 w-3" />
                PREMIUM FREQUENCIES • 320 KBPS
              </div>
              
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">AYUMUSIC</h1>
                <p className="text-lg font-medium text-neutral-400 leading-relaxed max-w-md">
                  High-fidelity sound resonance architected for the modern discovery journey. No ads. No friction.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp(() => playRandomTrack())}
                  className="rounded-full bg-primary text-white hover:bg-primary/90 font-black uppercase italic tracking-tight gap-3 h-14 px-10 lag-free-tap shadow-2xl shadow-primary/20 text-lg"
                >
                  <Play className="h-5 w-5 fill-current" /> Play Trending
                </Button>
                <Button 
                  variant="secondary"
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp(() => playRandomTrack())}
                  className="rounded-full bg-[#1e1e1e] border border-white/5 text-white hover:bg-white/10 font-black uppercase italic tracking-tight gap-3 h-14 px-10 lag-free-tap text-lg"
                >
                  <Shuffle className="h-5 w-5" /> Safal
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Dynamic List Section */}
        <section className="space-y-8 min-h-[400px]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{listTitle}</h2>
            {vibeLoading ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <Button 
                variant="ghost" 
                className="text-[10px] font-black text-white bg-white/5 rounded-full px-6 h-10 uppercase tracking-widest gap-2 hover:bg-white/10"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp(() => displaySongs.length > 0 && playTrack(displaySongs[0], displaySongs))}
              >
                <Play className="h-3 w-3 fill-current" /> Play all
              </Button>
            )}
          </div>
          
          <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300", vibeLoading && "opacity-50 pointer-events-none")}>
            {displaySongs.length > 0 ? (
              displaySongs.map((song) => (
                <div 
                  key={`daily-${song.id}`}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp(() => playTrack(song, displaySongs))}
                  className="flex items-center justify-between p-5 bg-[#1a1a1a] rounded-[2rem] border border-white/5 lag-free-tap transition-all hover:bg-white/5 hover:scale-[1.01] active:scale-[0.98] group cursor-pointer"
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden bg-neutral-900 shrink-0 shadow-lg relative border border-white/5">
                      <img src={getBestImage(song) || ''} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      {currentTrack?.id === song.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        "font-bold text-base leading-tight italic uppercase tracking-tight truncate", 
                        currentTrack?.id === song.id ? "text-primary" : "text-white"
                      )}>
                        {decodeEntities(song.name)}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate uppercase mt-1.5 font-black tracking-[0.15em]">
                        {song.artists.primary[0]?.name}
                      </p>
                    </div>
                  </div>
                  <button 
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp((e?: any) => { e?.stopPropagation(); toggleLike(song); })}
                    className="p-3 text-neutral-700 hover:text-primary transition-colors"
                  >
                    <Heart className={cn("h-6 w-6", isLiked(song.id) && "fill-primary text-primary")} />
                  </button>
                </div>
              ))
            ) : !vibeLoading && (
              <div className="col-span-full py-24 text-center opacity-40">
                <Search className="h-16 w-16 mx-auto mb-6 text-neutral-800" />
                <p className="font-black italic uppercase tracking-tighter text-xl">No frequencies resolved</p>
              </div>
            )}
          </div>
        </section>

        {/* Trending Lineage */}
        {!isSearching && (
          <>
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Trending Resonance</h2>
                <Button 
                  variant="ghost" 
                  className="text-[10px] font-black text-white bg-white/5 rounded-full px-6 h-10 uppercase tracking-widest gap-2 hover:bg-white/10"
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp(() => trendingSongs.length > 0 && playTrack(trendingSongs[0], trendingSongs))}
                >
                  <Play className="h-3 w-3 fill-current" /> Play all
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingSongs.map((song, i) => (
                  <div 
                    key={`trending-${song.id}`} 
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp(() => playTrack(song, trendingSongs))}
                    className="flex items-center justify-between p-5 bg-[#1a1a1a] rounded-[2rem] border border-white/5 lag-free-tap transition-all hover:bg-white/5 active:scale-[0.98] group cursor-pointer"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      <span className="text-xl font-black italic text-neutral-800 group-hover:text-primary transition-colors shrink-0 w-8">{i + 1}</span>
                      <div className="h-14 w-14 rounded-2xl overflow-hidden bg-neutral-900 shrink-0 shadow-lg relative border border-white/5">
                        <img src={getBestImage(song) || ''} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                      <div className="min-w-0">
                        <p className={cn(
                          "font-bold text-base leading-tight italic uppercase tracking-tight truncate", 
                          currentTrack?.id === song.id ? "text-primary" : "text-white"
                        )}>
                          {decodeEntities(song.name)}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate uppercase mt-1.5 font-black tracking-[0.15em]">
                          {song.artists.primary[0]?.name}
                        </p>
                      </div>
                    </div>
                    <button 
                      onPointerDown={handlePointerDown}
                      onPointerUp={handlePointerUp((e?: any) => { e?.stopPropagation(); toggleLike(song); })}
                      className="p-3 text-neutral-700 hover:text-primary transition-colors"
                    >
                      <Heart className={cn("h-6 w-6", isLiked(song.id) && "fill-primary text-primary")} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Regional Infinite Scrolls */}
            <HorizontalSection 
              title="Punjabi Hits" songs={punjabiSongs} type="punjabi" 
              onPlayAll={(songs) => playTrack(songs[0], songs)} onPlayTrack={playTrack}
              onLoadMore={loadMoreRegional} loadingMore={loadingMore.punjabi} currentTrackId={currentTrack?.id}
            />
            <HorizontalSection 
              title="Haryanvi Heart" songs={haryanviSongs} type="haryanvi" 
              onPlayAll={(songs) => playTrack(songs[0], songs)} onPlayTrack={playTrack}
              onLoadMore={loadMoreRegional} loadingMore={loadingMore.haryanvi} currentTrackId={currentTrack?.id}
            />
            <HorizontalSection 
              title="Bhojpuri Beats" songs={bhojpuriSongs} type="bhojpuri" 
              onPlayAll={(songs) => playTrack(songs[0], songs)} onPlayTrack={playTrack}
              onLoadMore={loadMoreRegional} loadingMore={loadingMore.bhojpuri} currentTrackId={currentTrack?.id}
            />
            <HorizontalSection 
              title="Lofi Resonance" songs={lofiSongs} type="lofi" 
              onPlayAll={(songs) => playTrack(songs[0], songs)} onPlayTrack={playTrack}
              onLoadMore={loadMoreRegional} loadingMore={loadingMore.lofi} currentTrackId={currentTrack?.id}
            />
          </>
        )}
      </main>
    </div>
  );
}
