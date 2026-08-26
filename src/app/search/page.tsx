
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Search, Music, Loader2, Disc, User, ListMusic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Song, searchSongs, searchAlbums, searchArtists, searchPlaylists, getBestImage, decodeEntities 
} from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMusic } from '@/components/music-player/player-context';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const categories = [
  { id: 'songs', label: 'Songs', icon: Music },
  { id: 'albums', label: 'Albums', icon: Disc },
  { id: 'artists', label: 'Artists', icon: User },
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('songs');
  const [loading, setLoading] = useState(false);
  const { playTrack } = useMusic();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        let data: any[] = [];
        switch (selectedCategory) {
          case 'songs':
            data = await searchSongs(query);
            break;
          case 'albums':
            data = await searchAlbums(query);
            break;
          case 'artists':
            data = await searchArtists(query);
            break;
          case 'playlists':
            data = await searchPlaylists(query);
            break;
        }
        const uniqueResults = Array.from(new Map(data.map(item => [item.id, item])).values());
        setResults(uniqueResults);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  return (
    <div className="p-8 pb-32 min-h-full max-w-7xl mx-auto bg-[#0a0a0a] text-white">
      {/* Search Bar */}
      <div className="max-w-2xl relative mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-neutral-500" />
        <Input
          placeholder="Search for high-fidelity sounds, artists, or vibes..."
          className="pl-16 bg-[#1e1e1e] border-none rounded-2xl h-16 text-xl focus-visible:ring-primary/50 shadow-2xl transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {loading && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3 mb-12 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
              selectedCategory === cat.id
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                : "bg-white/5 text-neutral-500 hover:text-white hover:bg-white/10"
            )}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {query ? (
        <div className="space-y-12 animate-in fade-in duration-500">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">{selectedCategory} Results</h2>
                <p className="text-[9px] font-bold text-primary italic tracking-widest uppercase">Verified Frequencies</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {loading ? (
                Array(10).fill(0).map((_, i) => (
                  <div key={`skeleton-${i}`} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl bg-[#1e1e1e]" />
                    <Skeleton className="h-4 w-3/4 bg-[#1e1e1e]" />
                  </div>
                ))
              ) : selectedCategory === 'songs' ? (
                results.map((song) => (
                  <SongCard key={`search-song-${song.id}`} song={song} playlist={results} />
                ))
              ) : (
                results.map((item) => (
                  <div 
                    key={`search-item-${item.id}`}
                    className="group glass-card p-4 rounded-2xl transition-all hover:bg-white/10 cursor-pointer"
                  >
                    <div className="relative aspect-square mb-4 rounded-xl overflow-hidden shadow-2xl bg-neutral-900 flex items-center justify-center">
                      {getBestImage(item) ? (
                        <Image
                          src={getBestImage(item)!}
                          alt={item.name}
                          fill
                          className={cn(
                            "object-cover transition-transform group-hover:scale-110",
                            selectedCategory === 'artists' && "rounded-full p-2"
                          )}
                          sizes="(max-width: 768px) 50vw, 200px"
                        />
                      ) : (
                        <Disc className="h-12 w-12 text-neutral-800" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm truncate uppercase tracking-tight italic text-white">
                        {decodeEntities(item.name || item.title)}
                      </h3>
                      <p className="text-[10px] text-neutral-400 truncate uppercase font-medium">
                        {selectedCategory === 'artists' ? 'Verified Artist' : (item.artists?.[0]?.name || item.artist || 'AYUMUSIC Curation')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {!loading && results.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-neutral-500 italic text-xl font-bold uppercase tracking-widest">No matching frequencies found.</p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
          <div className="bg-[#1e1e1e] p-12 rounded-full mb-8 border border-white/5">
            <Search className="h-24 w-24 text-neutral-800" />
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Discovery Engine</h2>
          <p className="text-neutral-500 max-w-sm font-medium uppercase tracking-tight">Search for an artist or vibe to architect your playback lineage.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-500 uppercase font-black italic">Loading discovery engine...</div>}>
      <SearchContent />
    </Suspense>
  );
}
