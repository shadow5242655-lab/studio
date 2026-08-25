'use client';

import React, { useEffect, useState, memo } from 'react';
import { Song, searchSongs, formatDuration } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Heart, Play, MoreVertical, ListMusic, Disc, Mic2, Music2, TrendingUp, Sparkles, Star } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';

const TopNavChips = () => {
  const chips = ["Songs", "Artists", "Albums", "Playlists", "Genres", "Moods", "Charts"];
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-4 px-4">
      {chips.map((chip) => (
        <button
          key={chip}
          className="whitespace-nowrap px-6 py-2 rounded-full bg-[#1e1e1e] hover:bg-[#282828] text-sm font-medium transition-colors border border-white/5 active:scale-95 touch-action-manipulation"
        >
          {chip}
        </button>
      ))}
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
  const { playTrack, toggleLike, isLiked, playRandomTrack } = useMusic();
  const [dailyPicks, setDailyPicks] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [picks, trendData] = await Promise.all([
        searchSongs("Banjaare Roni Manish Sonipat Aala"),
        searchSongs("Arijit Singh Top Hits 2024")
      ]);
      setDailyPicks(picks.slice(0, 8));
      setTrending(trendData.slice(0, 5));
      setLoading(false);
    }
    loadData();
  }, []);

  const handleInteraction = (callback: () => void) => (e: React.PointerEvent) => {
    e.preventDefault();
    callback();
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen pb-40 max-w-[480px] mx-auto shadow-2xl relative border-x border-white/5">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-30 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-black text-xl tracking-tighter text-white uppercase italic">AYUMUSIC</h1>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/5">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </header>

      <TopNavChips />

      <main className="space-y-10 py-4">
        {/* Daily Picks - Vertical List */}
        <section>
          <SectionHeader title="Daily picks" />
          <div className="px-4 space-y-3">
            {loading ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="h-16 bg-[#1e1e1e] rounded-xl animate-pulse" />)
            ) : (
              dailyPicks.map((song) => (
                <div 
                  key={song.id} 
                  className="flex items-center justify-between p-3 bg-[#1e1e1e] hover:bg-[#282828] rounded-xl transition-all group cursor-pointer border border-white/5"
                  onPointerUp={handleInteraction(() => playTrack(song, dailyPicks))}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                      <img src={song.image[1]?.link || song.image[0]?.link} className="h-full w-full object-cover" alt="" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-white truncate">{song.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{song.artists.primary.map(a => a.name).join(', ')}</p>
                    </div>
                  </div>
                  <button 
                    onPointerDown={(e) => { e.stopPropagation(); }}
                    onPointerUp={(e) => { e.stopPropagation(); toggleLike(song); }}
                    className="p-2 text-neutral-500 hover:text-primary transition-colors"
                  >
                    <Heart className={cn("h-5 w-5", isLiked(song.id) && "fill-primary text-primary")} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Trending Now - Numbered List */}
        <section className="bg-[#121212] py-8 border-y border-white/5">
          <SectionHeader title="Trending now" />
          <div className="px-4 space-y-4">
            {trending.map((song, idx) => (
              <div 
                key={song.id} 
                className="flex items-center gap-4 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                onPointerUp={handleInteraction(() => playTrack(song, trending))}
              >
                <span className="text-lg font-black text-neutral-700 italic min-w-[24px]">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate">{song.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{song.artists.primary[0].name}</p>
                </div>
                <span className="text-[10px] font-bold text-neutral-600 font-mono">{formatDuration(song.duration)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Horizontal Clusters */}
        <section>
          <SectionHeader title="Top charts" />
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 px-4 pb-4">
              {["INDIA SUPERHITS", "GLOBAL VIRAL", "BENGALI TOP 50", "HINDI HOT 50", "INDIE ROCK"].map((name, i) => (
                <div key={i} className="w-40 shrink-0 bg-[#1e1e1e] p-4 rounded-xl border border-white/5 space-y-3">
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

        <section>
          <SectionHeader title="Fresh playlists" />
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 px-4 pb-4">
              {["Viral Nation", "Chartbusters 2024", "Evening Vibe", "Morning Energy"].map((name, i) => (
                <div key={i} className="w-36 shrink-0 space-y-2">
                  <div className="aspect-square rounded-2xl bg-[#1e1e1e] flex items-center justify-center border border-white/5 relative overflow-hidden group">
                    <img src={`https://picsum.photos/seed/plist-${i}/300/300`} className="h-full w-full object-cover opacity-60 group-hover:scale-110 transition-transform" alt="" />
                    <Play className="absolute inset-0 m-auto h-8 w-8 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate">{name}</p>
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">50 songs • 109 saves</p>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        {/* Featured Highlight - Bottom */}
        <section className="px-4">
          <div className="relative h-48 rounded-3xl overflow-hidden group cursor-pointer border border-white/10" onPointerUp={handleInteraction(playRandomTrack)}>
            <img src="https://picsum.photos/seed/featured-pro/800/600" className="h-full w-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-1 block">Featured Release</span>
                <p className="text-lg font-black text-white italic uppercase tracking-tighter">Jamaican (Bam Bam)</p>
                <p className="text-xs font-bold text-neutral-400">Hugel, SOLTO (FR)</p>
              </div>
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-black shadow-2xl hover:scale-110 transition-transform">
                <Play className="h-6 w-6 fill-current ml-1" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
