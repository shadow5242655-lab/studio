'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Song, searchSongs, getBestImage, decodeEntities, getTrending } from '@/lib/music-api';
import { 
  Heart, Play, Music2, Search, Menu, Loader2, Smartphone, Settings2, Sparkles, Shuffle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';

export default function Home() {
  const { playTrack, toggleLike, isLiked, currentTrack, playRandomTrack } = useMusic();
  
  const [displaySongs, setDisplaySongs] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [listTitle, setListTitle] = useState('Daily Picks');
  const [loading, setLoading] = useState(true);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const startPos = useRef<{ x: number, y: number, time: number } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Neural Search Effect: Debounced Spotify-style live search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!searchQuery.trim()) {
      if (isSearching) {
        loadInitialData();
      }
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const dailyTerms = [
        "Sheesha Aakhya Mai Aakh Ghali",
        "Bairan Banjaare",
        "Fortuner Raj Mawar",
        "Kamar DJ Pe Manish Sonipat",
        "80 Lakh D Naveen",
        "Kabze Bintu Pabra",
        "Mithe Tere Bol Pari Masoom",
        "Barsaat Banjaare Roni"
      ];
      
      const dailyResults = await Promise.all(
        dailyTerms.map(t => searchSongs(t).then(r => r[0]))
      );

      const filteredDaily = dailyResults.filter(Boolean);
      setDisplaySongs(filteredDaily);

      // Fetch distinct trending songs
      const trending = await getTrending();
      const dailyIds = new Set(filteredDaily.map(s => s.id));
      // Ensure trending songs are not duplicates of daily picks
      const filteredTrending = trending.filter(s => !dailyIds.has(s.id)).slice(0, 10);
      setTrendingSongs(filteredTrending);

      setListTitle('Daily Picks');
      setIsSearching(false);
    } catch (e) {
      console.error("Initial load failed", e);
    } finally {
      setLoading(false);
    }
  }

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
    try {
      const results = await searchSongs(query);
      setDisplaySongs(results);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setVibeLoading(false);
    }
  };

  const handleVibeClick = (vibe: string) => {
    setSearchQuery(vibe);
  };

  const clearSearch = () => {
    setSearchQuery('');
    loadInitialData();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen pb-48 max-w-[480px] mx-auto border-x border-white/5 relative shadow-2xl overflow-x-hidden font-sans text-white selection:bg-primary/30">
      {/* 1. HEADER */}
      <header className="p-6 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg shadow-[0_0_15px_rgba(255,0,0,0.3)]">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">AYUMUSIC</span>
        </div>
        <Button variant="ghost" size="icon" className="hover:bg-white/5 text-white">
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      <main className="px-6 space-y-10">
        {/* 2. SEARCH BAR AREA */}
        <section className="flex items-center gap-4">
          <Music2 className="h-6 w-6 text-primary shrink-0" />
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
            <Input 
              placeholder="Search for sounds..." 
              className="pl-11 pr-10 bg-[#1e1e1e] border-none text-sm h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/50 placeholder:text-neutral-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-4 shrink-0">
            <Smartphone className="h-5 w-5 text-neutral-500 hover:text-white transition-colors cursor-pointer" />
            <Settings2 className="h-5 w-5 text-neutral-500 hover:text-white transition-colors cursor-pointer" />
          </div>
        </section>

        {/* 3. NAVIGATION CHIPS (VIBES) */}
        <section className="space-y-6">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Pick a Vibe</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
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
                  "rounded-2xl bg-[#1e1e1e] border border-white/5 px-6 h-12 text-xs font-black uppercase tracking-widest shrink-0 lag-free-tap hover:bg-primary/20 gap-2",
                  searchQuery === vibe.name && "ring-1 ring-primary"
                )}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp(() => handleVibeClick(vibe.name))}
              >
                <vibe.icon className="h-4 w-4 text-neutral-500" />
                {vibe.name}
              </Button>
            ))}
          </div>
        </section>

        {/* 4. MAIN RELEASE HIGHLIGHT (HERO) */}
        {!isSearching && (
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e1e1e] to-black p-8 border border-white/5 shadow-2xl group min-h-[300px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-8 text-white/5 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <Music2 className="h-48 w-48" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3" />
                NO ADS • NO SIGN-UP
              </div>
              
              <div className="space-y-3">
                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">AYUMUSIC</h1>
                <p className="text-sm font-medium text-neutral-400 leading-relaxed max-w-[240px]">
                  High-fidelity sound resonance straight from the source. Millions of tracks in <span className="text-primary font-bold">320 kbps</span>.
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp(() => playRandomTrack())}
                  className="rounded-full bg-primary text-white hover:bg-primary/90 font-black uppercase italic tracking-tight gap-2 h-12 px-8 lag-free-tap shadow-2xl shadow-primary/20"
                >
                  <Play className="h-4 w-4 fill-current" /> Play Trending
                </Button>
                <Button 
                  variant="secondary"
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp(() => playRandomTrack())}
                  className="rounded-full bg-[#1e1e1e] border border-white/5 text-white hover:bg-white/10 font-black uppercase italic tracking-tight gap-2 h-12 px-8 lag-free-tap"
                >
                  <Shuffle className="h-4 w-4" /> Shuffle
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* 5. DAILY PICKS / SEARCH RESULTS (VERTICAL LIST) */}
        <section className="space-y-6 relative min-h-[400px]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">{listTitle}</h2>
            {vibeLoading ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <Button 
                variant="ghost" 
                className="text-[10px] font-black text-white bg-white/5 rounded-full px-4 h-8 uppercase tracking-widest gap-2"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp(() => displaySongs.length > 0 && playTrack(displaySongs[0], displaySongs))}
              >
                <Play className="h-3 w-3 fill-current" /> Play all
              </Button>
            )}
          </div>
          
          <div className={cn("space-y-2 transition-opacity", vibeLoading && "opacity-50 pointer-events-none")}>
            {displaySongs.length > 0 ? (
              displaySongs.map((song) => (
                <div 
                  key={`item-${song.id}`}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp(() => playTrack(song, displaySongs))}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-[1.5rem] border border-white/5 lag-free-tap transition-transform active:scale-[0.98] group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 shadow-lg relative border border-white/5">
                      <img src={getBestImage(song) || ''} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      {currentTrack?.id === song.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        "font-bold text-sm leading-tight italic uppercase tracking-tight truncate", 
                        currentTrack?.id === song.id ? "text-primary" : "text-white"
                      )}>
                        {decodeEntities(song.name)}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate uppercase mt-1 font-black tracking-[0.1em]">
                        {song.artists.primary.map(a => decodeEntities(a.name)).join(', ')}
                      </p>
                    </div>
                  </div>
                  <button 
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp(() => toggleLike(song))}
                    className="p-2 text-neutral-700 hover:text-primary transition-colors"
                  >
                    <Heart className={cn("h-5 w-5", isLiked(song.id) && "fill-primary text-primary")} />
                  </button>
                </div>
              ))
            ) : !vibeLoading && (
              <div className="py-20 text-center opacity-40">
                <Search className="h-12 w-12 mx-auto mb-4 text-neutral-800" />
                <p className="font-black italic uppercase tracking-tighter">No frequencies found</p>
              </div>
            )}
          </div>
        </section>

        {/* 6. TRENDING NOW (VERTICAL LIST WITH PHOTOS) */}
        {!isSearching && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Trending Now</h2>
              <Button 
                variant="ghost" 
                className="text-[10px] font-black text-white bg-white/5 rounded-full px-4 h-8 uppercase tracking-widest gap-2"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp(() => trendingSongs.length > 0 && playTrack(trendingSongs[0], trendingSongs))}
              >
                <Play className="h-3 w-3 fill-current" /> Play all
              </Button>
            </div>
            <div className="space-y-3">
              {trendingSongs.length > 0 ? (
                trendingSongs.map((song, i) => (
                  <div 
                    key={`trending-${song.id}`} 
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp(() => playTrack(song, trendingSongs))}
                    className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-[1.5rem] border border-white/5 lag-free-tap transition-transform active:scale-[0.98] group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-lg font-black italic text-neutral-700 group-hover:text-primary transition-colors shrink-0 w-6">{i + 1}</span>
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-neutral-900 shrink-0 shadow-lg relative border border-white/5">
                        <img src={getBestImage(song) || ''} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        {currentTrack?.id === song.id && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={cn(
                          "font-bold text-sm leading-tight italic uppercase tracking-tight truncate", 
                          currentTrack?.id === song.id ? "text-primary" : "text-white"
                        )}>
                          {decodeEntities(song.name)}
                        </p>
                        <p className="text-[10px] text-neutral-500 truncate uppercase mt-1 font-black tracking-[0.1em]">
                          {song.artists.primary.map(a => decodeEntities(a.name)).join(', ')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onPointerDown={handlePointerDown}
                      onPointerUp={handlePointerUp(() => toggleLike(song))}
                      className="p-2 text-neutral-700 hover:text-primary transition-colors"
                    >
                      <Heart className={cn("h-5 w-5", isLiked(song.id) && "fill-primary text-primary")} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="h-20 flex items-center justify-center opacity-20">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 7. TOP CHARTS / FRESH PLAYLISTS (HORIZONTAL SCROLL) */}
        {!isSearching && (
          <section className="space-y-6">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Top Charts</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {['INDIA TOP 50', 'GLOBAL TOP 50', 'INDIE HITS', 'BENGALI BEATS'].map((chart, idx) => (
                <div 
                  key={chart} 
                  className="h-40 w-40 rounded-[2rem] bg-gradient-to-br from-primary/20 to-black border border-white/5 flex flex-col justify-end p-6 shrink-0 group hover:scale-105 transition-transform cursor-pointer"
                >
                  <Music2 className="h-8 w-8 text-primary mb-2" />
                  <p className="font-black italic uppercase tracking-tighter text-sm leading-none">{chart}</p>
                  <p className="text-[8px] text-neutral-500 uppercase tracking-widest mt-1">Updated Daily</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. NEW RELEASES / BUZZING ALBUMS */}
        {!isSearching && (
          <section className="space-y-6">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Buzzing Albums</h2>
            <div className="grid grid-cols-2 gap-4">
              {trendingSongs.slice(2, 6).map((song) => (
                <div 
                  key={`album-${song.id}`}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp(() => playTrack(song, trendingSongs))}
                  className="relative aspect-square rounded-[2rem] overflow-hidden group cursor-pointer border border-white/5"
                >
                  <img src={getBestImage(song) || ''} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <p className="font-black italic uppercase tracking-tighter text-xs truncate">{decodeEntities(song.name)}</p>
                    <p className="text-[7px] text-neutral-400 uppercase tracking-widest truncate">{song.artists.primary[0].name}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
