'use client';

import React, { useEffect, useState } from 'react';
import { Song, searchSongs, formatDuration } from '@/lib/music-api';
import { 
  Heart, Play, Music2, 
  Smartphone, Sliders, Sparkles, 
  Shuffle, Search, Heart as HeartIcon,
  PartyPopper, Coffee, Dumbbell, Frown, Ghost
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white tracking-tight px-4">Pick a vibe</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-4">
        {vibes.map((vibe) => (
          <button
            key={vibe.name}
            onPointerUp={() => { onVibeClick(vibe.query); setActive(vibe.name); }}
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

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center justify-between px-4 mb-4">
    <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
    <button className="text-xs font-bold text-neutral-500 uppercase tracking-widest hover:text-white transition-colors">See all</button>
  </div>
);

export default function Home() {
  const { playTrack, toggleLike, isLiked, playRandomTrack, currentTrack } = useMusic();
  const [dailyPicks, setDailyPicks] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [picks, trendData] = await Promise.all([
        searchSongs("Banjaare Roni Manish Sonipat Aala"),
        searchSongs("Arijit Singh Best 2024")
      ]);
      setDailyPicks(picks.slice(0, 10));
      setTrending(trendData.slice(0, 5));
      setLoading(false);
    }
    loadData();
  }, []);

  const handleVibeClick = async (query: string) => {
    setLoading(true);
    const results = await searchSongs(query);
    setDailyPicks(results.slice(0, 10));
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen pb-40 max-w-[480px] mx-auto shadow-2xl relative border-x border-white/5 font-sans selection:bg-primary/30">
      <header className="p-4 flex items-center gap-3 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-30 border-b border-white/5">
        <div className="text-primary hover:scale-110 transition-transform cursor-pointer" onPointerDown={() => router.push('/')}>
          <Music2 className="h-7 w-7" />
        </div>
        <form onSubmit={handleSearch} className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Songs, artists, albums, playlists..." 
            className="bg-[#1e1e1e] border-none rounded-full h-10 pl-10 text-sm focus-visible:ring-primary/30 text-white placeholder:text-neutral-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/5">
          <Smartphone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/5">
          <Sliders className="h-5 w-5" />
        </Button>
      </header>

      <main className="space-y-8 py-4">
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
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                AYUMUSIC
              </h1>
              <p className="text-sm text-neutral-400 font-medium leading-tight max-w-[280px]">
                Fresh sounds straight from the source — millions of tracks in <span className="text-primary font-bold">320 kbps</span>, synced lyrics, and offline-ready.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-2 relative z-10">
              <Button 
                className="bg-primary text-white rounded-full px-6 h-12 font-black gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform lag-free-tap"
                onPointerDown={(e) => { e.preventDefault(); playRandomTrack(); }}
              >
                <Play className="h-5 w-5 fill-current" />
                Play trending
              </Button>
              <Button 
                variant="outline"
                className="bg-white/5 border-white/10 text-white rounded-full px-6 h-12 font-black gap-2 hover:bg-white/10 lag-free-tap"
                onPointerDown={(e) => { e.preventDefault(); playRandomTrack(); }}
              >
                <Shuffle className="h-4 w-4" />
                Shuffle
              </Button>
              <Button 
                variant="ghost"
                className="text-neutral-500 hover:text-white font-bold lag-free-tap"
                onPointerDown={() => router.push('/genres')}
              >
                Browse catalog
              </Button>
            </div>
          </div>
        </section>

        <VibeChips onVibeClick={handleVibeClick} />

        <section>
          <SectionHeader title="Daily picks" />
          <div className="px-4 space-y-3">
            {loading ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="h-16 bg-[#1e1e1e] rounded-xl animate-pulse" />)
            ) : (
              dailyPicks.map((song) => (
                <div 
                  key={song.id} 
                  className={cn(
                    "flex items-center justify-between p-3 bg-[#1e1e1e] hover:bg-[#282828] rounded-xl transition-all group cursor-pointer border border-white/5 lag-free-tap",
                    currentTrack?.id === song.id && "border-primary/50 bg-[#282828]"
                  )}
                  onPointerDown={(e) => { e.preventDefault(); playTrack(song, dailyPicks); }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-white/5">
                      <img src={song.image[1]?.link || song.image[0]?.link} className="h-full w-full object-cover" alt="" />
                    </div>
                    <div className="min-w-0">
                      <p className={cn("font-bold text-sm truncate", currentTrack?.id === song.id ? "text-primary" : "text-white")}>{song.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{song.artists.primary.map(a => a.name).join(', ')}</p>
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
              ))
            )}
          </div>
        </section>

        <section className="bg-[#121212] py-8 border-y border-white/5">
          <SectionHeader title="Trending now" />
          <div className="px-4 space-y-4">
            {trending.map((song, idx) => (
              <div 
                key={song.id} 
                className="flex items-center gap-4 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group lag-free-tap"
                onPointerDown={(e) => { e.preventDefault(); playTrack(song, trending); }}
              >
                <span className="text-lg font-black text-neutral-700 italic min-w-[24px] group-hover:text-primary transition-colors">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate">{song.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{song.artists.primary[0].name}</p>
                </div>
                <span className="text-[10px] font-bold text-neutral-600 font-mono">{formatDuration(song.duration)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-10">
          <SectionHeader title="Top charts" />
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 px-4 pb-4">
              {["INDIA SUPERHITS", "GLOBAL VIRAL", "BENGALI TOP 50", "HINDI HOT 50", "INDIE ROCK"].map((name, i) => (
                <div key={i} className="w-40 shrink-0 bg-[#1e1e1e] p-4 rounded-xl border border-white/5 space-y-3 hover:bg-[#282828] transition-colors cursor-pointer lag-free-tap" onPointerDown={() => router.push(`/search?q=${encodeURIComponent(name)}`)}>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-primary to-neutral-800 flex items-center justify-center p-4">
                    <span className="text-xs font-black text-white text-center leading-none tracking-tighter uppercase italic">{name}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate">{name} TOP 50</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Verified Resonance</p>
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