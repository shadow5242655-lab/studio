'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Song, searchSongs, getBestImage, decodeEntities } from '@/lib/music-api';
import { 
  Heart, Play, Music2, Search, Menu, Loader2, Smartphone, Settings2, Sparkles, Shuffle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { playTrack, toggleLike, isLiked, currentTrack, playRandomTrack } = useMusic();
  const router = useRouter();
  
  const [dailyPicks, setDailyPicks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const startPos = useRef<{ x: number, y: number, time: number } | null>(null);

  useEffect(() => {
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
        
        const results = await Promise.all(
          dailyTerms.map(t => searchSongs(t).then(r => r[0]))
        );

        setDailyPicks(results.filter(Boolean));
      } catch (e) {
        console.error("Initial load failed", e);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleVibeClick = (vibe: string) => {
    router.push(`/search?q=${encodeURIComponent(vibe)}`);
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
      {/* HEADER */}
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
        {/* SEARCH BAR AREA */}
        <section className="flex items-center gap-4">
          <Music2 className="h-6 w-6 text-primary shrink-0" />
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input 
              placeholder="Search for sounds..." 
              className="pl-11 pr-4 bg-[#1e1e1e] border-none text-sm h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/50 placeholder:text-neutral-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex gap-4 shrink-0">
            <Smartphone className="h-5 w-5 text-neutral-500 hover:text-white transition-colors cursor-pointer" />
            <Settings2 className="h-5 w-5 text-neutral-500 hover:text-white transition-colors cursor-pointer" />
          </div>
        </section>

        {/* HERO CARD */}
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

        {/* PICK A VIBE */}
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
                className="rounded-2xl bg-[#1e1e1e] border border-white/5 px-6 h-12 text-xs font-black uppercase tracking-widest shrink-0 lag-free-tap hover:bg-primary/20 gap-2"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp(() => handleVibeClick(vibe.name))}
              >
                <vibe.icon className="h-4 w-4 text-neutral-500" />
                {vibe.name}
              </Button>
            ))}
          </div>
        </section>

        {/* DAILY PICKS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Daily Picks</h2>
            <Button 
              variant="ghost" 
              className="text-[10px] font-black text-white bg-white/5 rounded-full px-4 h-8 uppercase tracking-widest gap-2"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp(() => dailyPicks.length > 0 && playTrack(dailyPicks[0], dailyPicks))}
            >
              <Play className="h-3 w-3 fill-current" /> Play all
            </Button>
          </div>
          
          <div className="space-y-2">
            {dailyPicks.map((song) => (
              <div 
                key={`daily-${song.id}`}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp(() => playTrack(song, dailyPicks))}
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
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
