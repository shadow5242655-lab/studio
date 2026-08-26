
'use client';

import React, { useEffect, useState } from 'react';
import { Song, searchSongs, getBestImage, decodeEntities } from '@/lib/music-api';
import { 
  Heart, Play, Music2, Search, Menu, X, Loader2, Clock, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { playTrack, toggleLike, isLiked, currentTrack } = useMusic();
  const router = useRouter();
  
  // State for static lineages
  const [dailyPicks, setDailyPicks] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const dailyTerms = [
          "Barsaat Banjaare Roni",
          "Bairan Banjaare",
          "Sheesha Mitta Ror Swara Verma",
          "Fortuner Raj Mawar",
          "Kamar DJ Pe Manish Sonipat",
          "80 Lakh D Naveen",
          "Kabze Bintu Pabra",
          "Mithe Tere Bol Pari Masoom"
        ];
        
        const trendingTerms = [
          "Sohniye Tu Zubeen Garg",
          "Bhalolaage Tomake Arijit Singh",
          "Akasheo Alpo Neel Arijit Singh",
          "Dandelions Ruth B",
          "Boom Shaka Dhanda Nyoliwala"
        ];

        const [dailyRes, trendingRes] = await Promise.all([
          Promise.all(dailyTerms.map(t => searchSongs(t).then(r => r[0]))),
          Promise.all(trendingTerms.map(t => searchSongs(t).then(r => r[0])))
        ]);

        setDailyPicks(dailyRes.filter(Boolean));
        setTrendingSongs(trendingRes.filter(Boolean));
      } catch (e) {
        console.error("Initial load failed", e);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

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
    <div className="bg-[#0a0a0a] min-h-screen pb-48 max-w-[480px] mx-auto border-x border-white/5 relative shadow-2xl overflow-x-hidden font-sans">
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-40">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded-lg">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase italic">AYUMUSIC</span>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/5">
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      <main className="space-y-8 py-4">
        {/* Search Bar */}
        <div className="px-4">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input 
              placeholder="Search sounds, artists, vibes..." 
              className="pl-11 pr-10 bg-[#1a1a1a] border-none text-sm h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* 1. Top Navigation Chips */}
        <section className="px-4 overflow-x-auto no-scrollbar flex gap-3 pb-2">
          {["Songs", "Artists", "Albums", "Playlists", "Genres", "Moods"].map((chip) => (
            <Button 
              key={chip}
              variant="secondary" 
              className="rounded-full bg-[#1e1e1e] text-white border border-white/5 px-6 h-10 text-xs font-bold uppercase tracking-widest shrink-0 lag-free-tap hover:bg-primary/20"
              onPointerDown={(e) => { e.preventDefault(); handleVibeClick(chip); }}
            >
              {chip}
            </Button>
          ))}
        </section>

        {/* 2. Daily Picks (Vertical) */}
        <section className="px-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Daily Picks</h2>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest">View All</button>
          </div>
          
          <div className="space-y-3">
            {dailyPicks.map((song) => (
              <div 
                key={`daily-${song.id}`}
                onPointerDown={(e) => { e.preventDefault(); playTrack(song, dailyPicks); }}
                className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-2xl border border-white/5 lag-free-tap transition-transform active:scale-[0.98] group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 shadow-lg relative border border-white/5">
                    <img src={getBestImage(song) || ''} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    {currentTrack?.id === song.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "font-bold text-sm leading-tight italic uppercase tracking-tight", 
                      currentTrack?.id === song.id ? "text-primary" : "text-white"
                    )}>
                      {decodeEntities(song.name)}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate uppercase mt-1 font-bold tracking-widest">
                      {song.artists.primary.map(a => decodeEntities(a.name)).join(', ')}
                    </p>
                  </div>
                </div>
                <button 
                  onPointerDown={(e) => { e.stopPropagation(); toggleLike(song); }}
                  className="p-2 text-neutral-700 hover:text-primary transition-colors"
                >
                  <Heart className={cn("h-5 w-5", isLiked(song.id) && "fill-primary text-primary")} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Trending Now (Numbered) */}
        <section className="px-4 space-y-6 pt-4 border-t border-white/5">
          <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Trending Now</h2>
          <div className="space-y-4">
            {trendingSongs.map((song, idx) => (
              <div 
                key={`trending-${song.id}`}
                onPointerDown={(e) => { e.preventDefault(); playTrack(song, trendingSongs); }}
                className="flex items-center gap-4 group cursor-pointer lag-free-tap active:opacity-70"
              >
                <span className="text-sm font-black text-neutral-700 group-hover:text-primary transition-colors w-6 shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate italic uppercase tracking-tight">{decodeEntities(song.name)}</p>
                  <p className="text-[9px] text-neutral-500 truncate uppercase font-bold tracking-widest mt-0.5">{song.artists.primary[0]?.name}</p>
                </div>
                <div className="flex items-center gap-2 text-neutral-600 text-[10px] font-bold">
                  <Clock className="h-3 w-3" />
                  {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Top Charts */}
        <section className="space-y-4">
          <h2 className="px-4 text-xl font-black italic uppercase text-white tracking-tighter">Top Charts</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2">
            {[
              { name: 'India Superhits', genre: 'Hindi', duration: '50 Songs' },
              { name: 'Global Top 50', genre: 'International', duration: '50 Songs' },
              { name: 'Bengali Beats', genre: 'Bengali', duration: '30 Songs' },
              { name: 'Indie Rock', genre: 'Alternative', duration: '25 Songs' },
              { name: 'Bhajan Frequencies', genre: 'Devotional', duration: '20 Songs' },
              { name: 'Sufi Resonance', genre: 'Sufi', duration: '15 Songs' }
            ].map((chart, i) => (
              <div 
                key={i} 
                onPointerDown={() => handleVibeClick(chart.name)}
                className="min-w-[160px] bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 space-y-3 lag-free-tap hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-black rounded-xl flex items-center justify-center border border-white/5">
                  <Music2 className="h-10 w-10 text-primary/40" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-xs text-white italic uppercase">{chart.name}</p>
                  <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{chart.genre} • {chart.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Fresh Playlists */}
        <section className="space-y-4">
          <h2 className="px-4 text-xl font-black italic uppercase text-white tracking-tighter">Fresh Playlists</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2">
            {[
              { name: "Chartbusters 2026 - B...", songs: 50, saves: 109 },
              { name: "Chartbusters 2026 - In...", songs: 50, saves: 245 },
              { name: "Viral Nation", songs: 40, saves: 567 }
            ].map((playlist, i) => (
              <div key={i} className="min-w-[140px] space-y-2 group cursor-pointer lag-free-tap">
                <div className="aspect-square bg-[#1e1e1e] rounded-2xl overflow-hidden relative border border-white/5">
                  <img src={`https://picsum.photos/seed/playlist-${i}/300/300`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt="" />
                </div>
                <p className="font-bold text-[11px] text-white italic uppercase truncate tracking-tight">{playlist.name}</p>
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{playlist.songs} Songs • {playlist.saves} Saves</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. New Releases */}
        <section className="space-y-4">
          <h2 className="px-4 text-xl font-black italic uppercase text-white tracking-tighter">New Releases</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2">
            {["Byatha Nei", "WILD", "Vaaroon Forever", "Bolo Ki Tumi"].map((name, i) => (
              <div key={i} className="min-w-[120px] space-y-2 group cursor-pointer lag-free-tap">
                <div className="aspect-square rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-[#1e1e1e]">
                  <img src={`https://picsum.photos/seed/new-${i}/300/300`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
                <p className="font-bold text-[10px] text-white italic uppercase text-center truncate">{name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Buzzing Albums */}
        <section className="space-y-4">
          <h2 className="px-4 text-xl font-black italic uppercase text-white tracking-tighter">Buzzing Albums</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2">
            {["Hanuman Ansh", "Awarapan 2", "Deep Sleep", "East Bengal 100"].map((name, i) => (
              <div key={i} className="min-w-[140px] bg-[#1e1e1e] p-3 rounded-2xl border border-white/5 lag-free-tap active:bg-primary/5 transition-colors">
                <div className="aspect-video bg-neutral-900 rounded-xl mb-3 overflow-hidden">
                   <img src={`https://picsum.photos/seed/album-${i}/400/225`} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="" />
                </div>
                <p className="font-bold text-[10px] text-white uppercase italic truncate">{name}</p>
                <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest mt-1">Verified Resonance</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Main Release Highlight */}
        <section className="px-4 pb-12">
          <div 
            onPointerDown={() => handleVibeClick("Jamaican Bam Bam Hugel")}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/20 via-[#1e1e1e] to-black p-8 border border-white/5 shadow-2xl group cursor-pointer lag-free-tap"
          >
            <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <Sparkles className="h-48 w-48" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                Featured Release
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Jamaican</h1>
                <p className="text-lg font-bold text-neutral-400 italic uppercase">Bam Bam • Hugel, SOLTO (FR)</p>
              </div>
              <Button className="rounded-full bg-white text-black hover:bg-neutral-200 font-black uppercase italic tracking-tight gap-2 h-14 px-10 lag-free-tap shadow-2xl">
                <Play className="h-5 w-5 fill-current" /> Play Now
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

