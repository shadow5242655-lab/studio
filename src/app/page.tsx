'use client';

import React, { useEffect, useState } from 'react';
import { Song, searchSongs, getBestImage, decodeEntities } from '@/lib/music-api';
import { 
  Heart, Play, Music2, Search, Smartphone, Settings2, 
  Sparkles, Shuffle, Menu, Heart as HeartIcon, 
  Coffee, Dumbbell, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';

export default function Home() {
  const { playTrack, toggleLike, isLiked, currentTrack } = useMusic();
  const [dailyPicks, setDailyPicks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const dailyTerms = [
          "Sheesha Aakhya Mai Aakh",
          "Bairan Banjaare",
          "Fortuner Raj Mawar",
          "Kamar DJ Pe Manish",
          "80 Lakh D Naveen",
          "Kabze Bintu Pabra",
          "Mithe Tere Bol Masoom"
        ];
        const dailyRes = await Promise.all(
          dailyTerms.map(t => searchSongs(t).then(r => r[0]))
        );
        setDailyPicks(dailyRes.filter(Boolean));
      } catch (e) {
        console.error("Data load failed", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSongPlay = (song: Song, list: Song[]) => {
    playTrack(song, list);
  };

  return (
    <div className="bg-black min-h-screen pb-48 max-w-[480px] mx-auto border-x border-white/5 relative shadow-2xl">
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded-full">
            <Music2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase italic">AYUMUSIC</span>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      <main className="py-4">
        {/* Search Bar */}
        <div className="px-4 flex items-center gap-3 mb-8">
          <Music2 className="h-6 w-6 text-primary" />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input 
              placeholder="Search for sounds..." 
              className="pl-9 bg-[#1a1a1a] border-none text-sm h-11 rounded-xl focus-visible:ring-primary/50" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              <Smartphone className="h-4 w-4 text-neutral-500" />
              <Settings2 className="h-4 w-4 text-neutral-500" />
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <div className="px-4 mb-10">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#2a1a1a] via-[#1a1a1a] to-black p-8 border border-white/5 shadow-2xl">
            <div className="absolute top-8 right-8 text-primary/5 -rotate-12 pointer-events-none">
              <Music2 className="h-40 w-40" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-[9px] font-bold text-neutral-300 uppercase tracking-widest">
                <Sparkles className="h-3 w-3 text-primary" /> NO ADS • NO SIGN-UP
              </div>
              <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">AYUMUSIC</h1>
              <p className="text-sm text-neutral-400 max-w-[260px] leading-relaxed font-medium">
                High-fidelity sound resonance straight from the source. Millions of tracks in <span className="text-primary font-bold">320 kbps</span>.
              </p>
              <div className="flex gap-3">
                <Button className="rounded-full bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-tight gap-2 h-12 px-8 lag-free-tap shadow-lg shadow-primary/20">
                  <Play className="h-4 w-4 fill-current" /> Play Trending
                </Button>
                <Button variant="secondary" className="rounded-full bg-white/5 hover:bg-white/10 text-white font-black uppercase italic tracking-tight gap-2 h-12 px-8 border border-white/5 lag-free-tap">
                  <Shuffle className="h-4 w-4" /> Shuffle
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Vibe Chips */}
        <section className="px-4 mb-10">
          <h2 className="text-lg font-black italic uppercase text-white tracking-tighter mb-4">PICK A VIBE</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {[
              { name: 'Romance', icon: HeartIcon },
              { name: 'Party', icon: Star },
              { name: 'Lo-fi', icon: Coffee },
              { name: 'Workout', icon: Dumbbell }
            ].map((vibe) => (
              <Button 
                key={vibe.name}
                variant="secondary" 
                className="rounded-2xl bg-[#1a1a1a] text-white border border-white/5 px-6 h-12 gap-3 font-bold uppercase italic tracking-tighter lag-free-tap shrink-0"
              >
                <vibe.icon className="h-4 w-4 text-neutral-400" /> {vibe.name}
              </Button>
            ))}
          </div>
        </section>

        {/* Daily Picks */}
        <section>
          <div className="flex items-center justify-between px-4 mb-6">
            <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">DAILY PICKS</h2>
            <button 
              onPointerDown={(e) => { e.preventDefault(); dailyPicks.length > 0 && handleSongPlay(dailyPicks[0], dailyPicks); }}
              className="flex items-center gap-1.5 text-[10px] font-black text-white bg-white/5 px-4 py-2 rounded-xl lag-free-tap active:scale-95"
            >
              <Play className="h-3 w-3 fill-current" /> PLAY ALL
            </button>
          </div>
          
          <div className="px-4 space-y-3">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={`daily-skeleton-${i}`} className="h-20 bg-[#1a1a1a] rounded-2xl animate-pulse" />
              ))
            ) : dailyPicks.map((song) => (
              <div 
                key={song.id} 
                onPointerDown={(e) => { e.preventDefault(); handleSongPlay(song, dailyPicks); }}
                className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-[1.25rem] border border-white/5 lag-free-tap cursor-pointer active:scale-[0.98] transition-transform group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 shadow-lg border border-white/5">
                    <img src={getBestImage(song) || ''} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "font-bold text-sm leading-tight italic uppercase tracking-tight", 
                      currentTrack?.id === song.id ? "text-primary" : "text-white"
                    )}>
                      {decodeEntities(song.name)}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate uppercase mt-1 font-bold tracking-widest">
                      {song.artists.primary.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </div>
                <button 
                  onPointerDown={(e) => { e.stopPropagation(); toggleLike(song); }}
                  className="p-2 text-neutral-700 hover:text-primary transition-colors lag-free-tap"
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
