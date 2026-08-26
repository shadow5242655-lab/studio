'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Song, searchSongs, formatDuration, getBestImage, decodeEntities } from '@/lib/music-api';
import { 
  Heart, Play, Music2, 
  Search, X, Heart as HeartIcon,
  ListMusic, Bookmark, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const TopChips = () => {
  const chips = ["Songs", "Artists", "Albums", "Playlists", "Genres", "Podcasts"];
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-4">
      {chips.map((chip) => (
        <button
          key={chip}
          className="flex-shrink-0 px-5 py-2 rounded-full bg-[#1e1e1e] border border-white/5 text-xs font-bold text-neutral-400 hover:text-white hover:bg-[#282828] transition-all lag-free-tap"
        >
          {chip}
        </button>
      ))}
    </div>
  );
};

const SectionHeader = ({ title, showPlayAll, onPlayAll }: { title: string, showPlayAll?: boolean, onPlayAll?: () => void }) => (
  <div className="flex items-center justify-between px-4 mb-4">
    <h2 className="text-xl font-bold tracking-tight text-white uppercase">{title}</h2>
    {showPlayAll && (
      <button 
        onClick={onPlayAll}
        className="flex items-center gap-1.5 text-[10px] font-black text-white bg-white/5 px-3 py-1.5 rounded-full lag-free-tap"
      >
        <Play className="h-3 w-3 fill-current" /> PLAY ALL
      </button>
    )}
  </div>
);

export default function Home() {
  const { playTrack, toggleLike, isLiked, currentTrack } = useMusic();
  const [dailyPicks, setDailyPicks] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [charts, setCharts] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const dailyTerms = [
          "Barsaat Banjaare Roni",
          "Bairan Banjaare",
          "Sheesha Mitta Ror",
          "Fortuner Raj Mawar",
          "Kamar DJ Pe मनीष",
          "80 Lakh D Naveen",
          "Kabze Bintu Pabra",
          "Mithe Tere Bol Masoom"
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
        setTrending(trendingRes.filter(Boolean));
        
        setCharts([
          { name: "INDIA SUPERHITS TOP 50", sub: "Hindi Hits", duration: "2h 45m" },
          { name: "GLOBAL TOP 50", sub: "International", duration: "3h 10m" },
          { name: "BENGALI BEATS", sub: "Regional", duration: "1h 50m" },
          { name: "INDIE ROCK", sub: "Alternative", duration: "2h 15m" },
          { name: "BHAJAN", sub: "Devotional", duration: "4h 00m" },
          { name: "SUFI", sub: "Traditional", duration: "3h 20m" }
        ]);

        setPlaylists([
          { name: "Chartbusters 2026 - B...", songs: 50, saves: 109 },
          { name: "Chartbusters 2026 - In...", songs: 45, saves: 88 },
          { name: "Viral Nation", songs: 60, saves: 245 }
        ]);

        const releaseRes = await searchSongs("Latest Hits 2024", 1);
        setReleases(releaseRes.slice(0, 6));

        const albumRes = await searchSongs("Popular Albums", 1);
        setAlbums(albumRes.slice(0, 6));

      } catch (e) {
        console.error("Data load failed", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-[#0a0a0a] min-h-screen pb-48 max-w-[480px] mx-auto border-x border-white/5 relative shadow-2xl">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-30 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded-lg"><Music2 className="h-5 w-5 text-white" /></div>
          <span className="font-black text-lg tracking-tighter text-white uppercase italic">AYUMUSIC</span>
        </div>
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-neutral-400" />
          <div className="h-8 w-8 rounded-full bg-neutral-800 border border-white/10" />
        </div>
      </header>

      <main className="space-y-10 py-4">
        <TopChips />

        {/* 2. Daily Picks */}
        <section>
          <SectionHeader title="Daily picks" showPlayAll onPlayAll={() => dailyPicks.length > 0 && playTrack(dailyPicks[0], dailyPicks)} />
          <div className="px-4 space-y-2">
            {dailyPicks.map((song) => (
              <div 
                key={song.id} 
                onClick={() => playTrack(song, dailyPicks)}
                className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded-xl border border-white/5 lag-free-tap"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                    <img src={getBestImage(song) || ''} className="h-full w-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("font-bold text-sm truncate", currentTrack?.id === song.id ? "text-primary" : "text-white")}>{decodeEntities(song.name)}</p>
                    <p className="text-[10px] text-neutral-500 truncate uppercase">{song.artists.primary.map(a => a.name).join(', ')}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                  className="p-2 text-neutral-600 hover:text-primary transition-colors"
                >
                  <Heart className={cn("h-5 w-5", isLiked(song.id) && "fill-primary text-primary")} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Trending Now */}
        <section>
          <SectionHeader title="Trending now" />
          <div className="px-4 space-y-2">
            {trending.map((song, idx) => (
              <div 
                key={song.id} 
                onClick={() => playTrack(song, trending)}
                className="flex items-center gap-4 p-2 hover:bg-white/5 rounded-xl transition-all lag-free-tap"
              >
                <span className="text-sm font-bold text-neutral-600 min-w-[20px] text-center">{idx + 1}</span>
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                  <img src={getBestImage(song) || ''} className="h-full w-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-bold text-sm truncate", currentTrack?.id === song.id ? "text-primary" : "text-white")}>{decodeEntities(song.name)}</p>
                  <p className="text-[10px] text-neutral-500 truncate uppercase">{song.artists.primary.map(a => a.name).join(', ')}</p>
                </div>
                <span className="text-[10px] font-medium text-neutral-500 font-mono">{formatDuration(song.duration)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Top Charts */}
        <section>
          <SectionHeader title="Top charts" />
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-4">
            {charts.map((chart) => (
              <div key={chart.name} className="min-w-[160px] p-4 bg-[#1e1e1e] rounded-xl border border-white/5 space-y-3">
                <div className="aspect-square bg-neutral-800 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-10 w-10 text-neutral-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">{chart.name}</h3>
                  <p className="text-[9px] text-neutral-500 uppercase font-medium mt-1">{chart.sub} • {chart.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Fresh Playlists */}
        <section>
          <SectionHeader title="Fresh playlists" />
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-4">
            {playlists.map((pl) => (
              <div key={pl.name} className="min-w-[140px] space-y-2">
                <div className="aspect-square bg-[#1e1e1e] rounded-xl border border-white/5 flex items-center justify-center">
                  <ListMusic className="h-12 w-12 text-neutral-800" />
                </div>
                <div className="px-1">
                  <h3 className="text-[11px] font-bold text-white truncate">{pl.name}</h3>
                  <p className="text-[9px] text-neutral-500 uppercase">{pl.songs} Songs • {pl.saves} Saves</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. New Releases */}
        <section>
          <SectionHeader title="New releases" />
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-4">
            {releases.map((song) => (
              <div key={song.id} onClick={() => playTrack(song)} className="min-w-[140px] space-y-2 cursor-pointer">
                <div className="aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-white/5">
                  <img src={getBestImage(song) || ''} className="h-full w-full object-cover" alt="" />
                </div>
                <div className="px-1">
                  <h3 className="text-[11px] font-bold text-white truncate">{decodeEntities(song.name)}</h3>
                  <p className="text-[9px] text-neutral-500 truncate uppercase">{song.artists.primary[0].name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Buzzing Albums */}
        <section>
          <SectionHeader title="Buzzing albums" />
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-4">
            {albums.map((song) => (
              <div key={song.id} onClick={() => playTrack(song)} className="min-w-[140px] space-y-2 cursor-pointer">
                <div className="aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-white/5">
                  <img src={getBestImage(song) || ''} className="h-full w-full object-cover" alt="" />
                </div>
                <div className="px-1">
                  <h3 className="text-[11px] font-bold text-white truncate">{decodeEntities(song.name)}</h3>
                  <p className="text-[9px] text-neutral-500 truncate uppercase">Featured Artist</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Main Release Highlight */}
        <section className="px-4">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#282828] to-[#121212] p-6 border border-white/5 flex items-center gap-6">
            <div className="h-24 w-24 rounded-lg bg-neutral-800 overflow-hidden shrink-0 shadow-2xl">
              <img src="https://picsum.photos/seed/highlight/200/200" className="h-full w-full object-cover" alt="" />
            </div>
            <div className="flex-1 space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Featured Release</span>
              <h3 className="text-lg font-black text-white italic leading-tight">Jamaican (Bam Bam)</h3>
              <p className="text-xs text-neutral-500 uppercase font-bold">Hugel, SOLTO (FR)</p>
              <Button size="sm" className="rounded-full bg-white text-black font-black mt-2 lag-free-tap">PLAY NOW</Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}