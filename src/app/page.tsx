'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Song, searchSongs, formatDuration, getBestImage } from '@/lib/music-api';
import { 
  Heart, Play, Music2, 
  Smartphone, Sliders, Sparkles, 
  Shuffle, Search, Heart as HeartIcon,
  PartyPopper, Coffee, Dumbbell, Frown, Ghost, Loader2, X
} from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

const VibeChips = ({ onVibeClick }: { onVibeClick: (vibe: string) => void }) => {
  const vibes = [
    { name: "Romance", icon: HeartIcon, query: "Romantic Songs" },
    { name: "Party", icon: PartyPopper, query: "Party Dance Hits" },
    { name: "Lo-fi", icon: Coffee, query: "Lo-fi Beats" },
    { name: "Workout", icon: Dumbbell, query: "Gym Workout Rap" },
    { name: "Sad", icon: Frown, query: "Sad Emotional Songs" },
    { name: "Phonk", icon: Ghost, query: "Phonk Night Drive" },
  ];

  const [active, setActive] = useState('');
  const startPos = useRef<{ x: number, y: number, time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handleInteraction = (query: string, name: string) => (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    const dt = Date.now() - startPos.current.time;
    
    if (dx < 10 && dy < 10 && dt < 300) {
      onVibeClick(query);
      setActive(name);
    }
    startPos.current = null;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white tracking-tight px-4 font-sans">Pick a vibe</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-4">
        {vibes.map((vibe) => (
          <button
            key={vibe.name}
            onPointerDown={handlePointerDown}
            onPointerUp={handleInteraction(vibe.query, vibe.name)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-xl transition-all border lag-free-tap font-bold text-sm",
              active === vibe.name 
                ? "bg-primary border-primary text-white scale-105" 
                : "bg-[#1e1e1e] border-white/5 text-neutral-400 hover:text-white hover:bg-[#282828]"
            )}
          >
            <vibe.icon className="h-4 w-4" />
            {vibe.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const SectionHeader = ({ title, actionLabel, onAction }: { title: string, actionLabel?: string, onAction?: () => void }) => {
  const startPos = useRef<{ x: number, y: number } | null>(null);
  const isPlayAll = actionLabel === "Play all";

  return (
    <div className="flex items-center justify-between px-4 mb-4">
      <h2 className="text-xl font-bold tracking-tight text-white font-sans">{title}</h2>
      {onAction && (
        <button 
          onPointerDown={(e) => { startPos.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={(e) => {
            if (!startPos.current) return;
            const dx = Math.abs(e.clientX - startPos.current.x);
            const dy = Math.abs(e.clientY - startPos.current.y);
            if (dx < 10 && dy < 10) {
              e.preventDefault(); 
              onAction();
            }
            startPos.current = null;
          }}
          className={cn(
            "flex items-center gap-1.5 transition-all active:scale-95",
            isPlayAll 
              ? "bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-4 py-1.5 rounded-full border border-white/5" 
              : "text-[10px] font-black text-primary uppercase tracking-widest hover:underline hover:scale-105"
          )}
        >
          {isPlayAll && <Play className="h-3 w-3 fill-current" />}
          {actionLabel || "See all"}
        </button>
      )}
    </div>
  );
};

export default function Home() {
  const { playTrack, toggleLike, isLiked, playRandomTrack, currentTrack } = useMusic();
  const [dailyPicks, setDailyPicks] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [liveResults, setLiveResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const startPos = useRef<{ x: number, y: number, time: number } | null>(null);

  // Load initial data matching the screenshot and user requests
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Daily Picks: requested samples
        const picks = await searchSongs("Barsaat Roni Swara Verma मनीष Fortuner Kabze");
        
        // Trending: specific songs from the screenshot
        const trendingTerms = [
          "Sohniye Tu Original Zubeen Garg",
          "Bhalolaage Tomake Arijit Singh",
          "Akasheo Alpo Neel Arijit Singh",
          "Dandelions Ruth B",
          "Boom Shaka Dhanda Nyoliwala",
          "Amer Achaar Acoustic Dipankar"
        ];
        
        const trendingResults = await Promise.all(
          trendingTerms.map(async (term) => {
            const res = await searchSongs(term);
            return res[0];
          })
        );

        setDailyPicks(picks.slice(0, 10));
        setTrending(trendingResults.filter(Boolean));
      } catch (e) {
        console.error("Initial load failed", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Instant Live Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setSearching(true);
        try {
          const results = await searchSongs(searchQuery);
          setLiveResults(results.slice(0, 12));
        } catch (e) {
          console.error("Search failed", e);
        } finally {
          setSearching(false);
        }
      } else {
        setLiveResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handleInteraction = (callback: () => void) => (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    const dt = Date.now() - startPos.current.time;
    
    // Distinguish between scroll and click
    if (dx < 10 && dy < 10 && dt < 300) {
      callback();
    }
    startPos.current = null;
  };

  const handlePointerCancel = () => {
    startPos.current = null;
  };

  const handleVibeClick = async (query: string) => {
    setLoading(true);
    const results = await searchSongs(query);
    setDailyPicks(results.slice(0, 10));
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setLiveResults([]);
  };

  return (
    <div className="bg-[#000000] min-h-screen pb-40 max-w-[480px] mx-auto shadow-2xl relative border-x border-white/5 font-sans selection:bg-primary/30">
      <header className="p-4 flex items-center gap-3 sticky top-0 bg-[#000000]/95 backdrop-blur-md z-30 border-b border-white/5">
        <div 
          className="text-primary hover:scale-110 transition-transform cursor-pointer" 
          onPointerDown={handlePointerDown}
          onPointerUp={handleInteraction(() => router.push('/'))}
        >
          <Music2 className="h-7 w-7" />
        </div>
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search for sounds..." 
            className="bg-[#1e1e1e] border border-primary/20 rounded-full h-10 pl-10 pr-10 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-neutral-600 transition-all font-sans"
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
        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/5">
          <Smartphone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/5">
          <Sliders className="h-5 w-5" />
        </Button>
      </header>

      <main className="space-y-8 py-4">
        {/* Instant Search Results Section */}
        {searchQuery.trim().length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between px-4 mb-4">
               <div className="flex items-center gap-2">
                 <h2 className="text-xl font-bold tracking-tight text-white italic uppercase font-sans">Live Results</h2>
                 {searching && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
               </div>
               <button 
                 onPointerDown={handlePointerDown}
                 onPointerUp={handleInteraction(() => router.push(`/search?q=${encodeURIComponent(searchQuery)}`))}
                 className="text-[10px] font-black text-primary uppercase tracking-widest"
               >
                 Discovery Mode
               </button>
            </div>
            
            <div className="px-4 space-y-3">
              {liveResults.length > 0 ? (
                liveResults.map((song) => {
                  const img = getBestImage(song);
                  return (
                    <div 
                      key={`live-${song.id}`} 
                      className={cn(
                        "flex items-center justify-between p-3 bg-[#1e1e1e] hover:bg-[#282828] rounded-xl transition-all group cursor-pointer border border-white/5 lag-free-tap",
                        currentTrack?.id === song.id && "border-primary/50 bg-[#282828]"
                      )}
                      onPointerDown={handlePointerDown}
                      onPointerUp={handleInteraction(() => playTrack(song, liveResults))}
                      onPointerCancel={handlePointerCancel}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-white/5 relative flex items-center justify-center">
                          {img ? (
                            <img src={img} className="h-full w-full object-cover" alt="" />
                          ) : (
                            <Music2 className="h-5 w-5 text-neutral-800" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={cn("font-bold text-sm truncate font-sans", currentTrack?.id === song.id ? "text-primary" : "text-white")}>{song.name}</p>
                          <p className="text-[10px] text-neutral-500 truncate uppercase font-medium font-sans">{song.artists.primary.map(a => a.name).join(', ')}</p>
                        </div>
                      </div>
                      <Heart className={cn("h-4 w-4 text-neutral-600", isLiked(song.id) && "fill-primary text-primary")} />
                    </div>
                  );
                })
              ) : !searching && (
                <p className="px-4 text-neutral-500 text-sm italic font-sans">Scanning frequencies...</p>
              )}
            </div>
          </section>
        )}

        {/* Hero Section */}
        {searchQuery.trim().length === 0 && (
          <>
            <section className="px-4">
              <div className="relative rounded-[2rem] overflow-hidden p-8 space-y-6 bg-gradient-to-br from-primary/10 via-neutral-900 to-black border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Music2 className="h-40 w-40 text-primary rotate-12" />
                </div>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.2em] text-primary uppercase">
                  <Sparkles className="h-3 w-3" />
                  No Ads • No Sign-up
                </div>
                
                <div className="space-y-2 relative z-10">
                  <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-[0.9] font-sans">
                    AYUMUSIC
                  </h1>
                  <p className="text-sm text-neutral-400 font-medium leading-tight max-w-[280px] font-sans">
                    High-fidelity sound resonance straight from the source. Millions of tracks in <span className="text-primary font-bold">320 kbps</span>.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-2 relative z-10">
                  <Button 
                    className="bg-primary text-white rounded-full px-6 h-12 font-black gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform lag-free-tap font-sans"
                    onPointerDown={handlePointerDown}
                    onPointerUp={handleInteraction(() => playRandomTrack())}
                  >
                    <Play className="h-5 w-5 fill-current" />
                    Play Trending
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white rounded-full px-6 h-12 font-black gap-2 hover:bg-white/10 lag-free-tap font-sans"
                    onPointerDown={handlePointerDown}
                    onPointerUp={handleInteraction(() => playRandomTrack())}
                  >
                    <Shuffle className="h-4 w-4" />
                    Shuffle
                  </Button>
                </div>
              </div>
            </section>

            <VibeChips onVibeClick={handleVibeClick} />
          </>
        )}

        {/* Daily Picks Section */}
        <section>
          <SectionHeader 
            title="Daily picks" 
            actionLabel="Play all" 
            onAction={() => dailyPicks.length > 0 && playTrack(dailyPicks[0], dailyPicks)} 
          />
          <div className="px-4 space-y-2">
            {loading ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="h-16 bg-[#1e1e1e] rounded-xl animate-pulse" />)
            ) : (
              dailyPicks.map((song) => {
                const img = getBestImage(song);
                return (
                  <div 
                    key={song.id} 
                    className={cn(
                      "flex items-center justify-between p-3 bg-[#1e1e1e] hover:bg-[#282828] rounded-xl transition-all group cursor-pointer border border-white/5 lag-free-tap",
                      currentTrack?.id === song.id && "border-primary/50 bg-[#282828]"
                    )}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handleInteraction(() => playTrack(song, dailyPicks))}
                    onPointerCancel={handlePointerCancel}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-white/5 relative flex items-center justify-center">
                        {img ? (
                          <img src={img} className="h-full w-full object-cover" alt="" />
                        ) : (
                          <Music2 className="h-6 w-6 text-neutral-800" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={cn("font-bold text-sm truncate font-sans", currentTrack?.id === song.id ? "text-primary" : "text-white")}>{song.name}</p>
                        <p className="text-[10px] text-neutral-500 truncate uppercase font-medium font-sans">{song.artists.primary.map(a => a.name).join(', ')}</p>
                      </div>
                    </div>
                    <button 
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerUp={(e) => { e.stopPropagation(); toggleLike(song); }}
                      className="p-2 text-neutral-600 hover:text-primary transition-colors"
                    >
                      <Heart className={cn("h-5 w-5", isLiked(song.id) && "fill-primary text-primary")} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Trending Now Section - Reference Matched Layout from Screenshot */}
        <section className="py-8">
          <SectionHeader 
            title="Trending now" 
            actionLabel="Play all" 
            onAction={() => trending.length > 0 && playTrack(trending[0], trending)} 
          />
          <div className="px-4 space-y-2">
            {loading ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="h-14 bg-[#1e1e1e] rounded-lg animate-pulse" />)
            ) : (
              trending.map((song, idx) => {
                const img = getBestImage(song);
                const isExplicit = song.name.toLowerCase().includes("boom shaka");
                
                return (
                  <div 
                    key={song.id} 
                    className={cn(
                      "flex items-center gap-4 p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer group lag-free-tap relative",
                      currentTrack?.id === song.id && "bg-white/5"
                    )}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handleInteraction(() => playTrack(song, trending))}
                    onPointerCancel={handlePointerCancel}
                  >
                    {/* Rank Number */}
                    <span className="text-sm font-bold text-neutral-600 min-w-[20px] text-center font-sans">{idx + 1}</span>
                    
                    {/* Song Artwork */}
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-white/5 relative flex items-center justify-center">
                      {img ? (
                        <img src={img} className="h-full w-full object-cover" alt="" />
                      ) : (
                        <Music2 className="h-6 w-6 text-neutral-800" />
                      )}
                    </div>

                    {/* Meta Data */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className={cn("font-bold text-sm text-white truncate font-sans", currentTrack?.id === song.id && "text-primary")}>{song.name}</p>
                        {isExplicit && (
                          <span className="shrink-0 text-[8px] bg-neutral-700 text-neutral-300 font-bold px-1 rounded-sm">E</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 truncate font-sans">{song.artists.primary.map(a => a.name).join(', ')}</p>
                    </div>

                    {/* Heart Action */}
                    <button 
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerUp={(e) => { e.stopPropagation(); toggleLike(song); }}
                      className="p-2 text-neutral-400 hover:text-white transition-colors"
                    >
                      <Heart className={cn("h-4 w-4", isLiked(song.id) && "fill-white text-white")} />
                    </button>

                    {/* Duration */}
                    <span className="text-xs font-medium text-neutral-500 min-w-[35px] text-right font-mono">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="pb-10">
          <SectionHeader title="Top charts" />
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 px-4 pb-4">
              {["INDIA SUPERHITS", "GLOBAL VIRAL", "BENGALI TOP 50", "HINDI HOT 50", "INDIE ROCK"].map((name, i) => (
                <div 
                  key={i} 
                  className="w-40 shrink-0 bg-[#1e1e1e] p-4 rounded-xl border border-white/5 space-y-3 hover:bg-[#282828] transition-colors cursor-pointer lag-free-tap" 
                  onPointerDown={handlePointerDown}
                  onPointerUp={handleInteraction(() => router.push(`/search?q=${encodeURIComponent(name)}`))}
                >
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-primary to-neutral-800 flex items-center justify-center p-4">
                    <span className="text-xs font-black text-white text-center leading-none tracking-tighter uppercase italic font-sans">{name}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate font-sans">{name} TOP 50</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black font-sans">Verified Resonance</p>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      </main>
    </div>
  );
}
