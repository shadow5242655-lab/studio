
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Search, Music, Disc, ListMusic, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Song, searchSongs, 
  Album, searchAlbums, 
  PlaylistResult, searchPlaylists,
  getBestImage,
  getArtistNames
} from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useMusic } from '@/components/music-player/player-context';
import { useSearchParams } from 'next/navigation';

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [rawSongs, setRawSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { playTrack, songPopularity, recordSearchSelection } = useMusic();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setRawSongs([]);
        setAlbums([]);
        setPlaylists([]);
        return;
      }
      setLoading(true);
      try {
        const [songData, albumData, playlistData] = await Promise.all([
          searchSongs(query),
          searchAlbums(query),
          searchPlaylists(query)
        ]);
        
        // Deduplicate
        const uniqueSongs = Array.from(new Map(songData.map(item => [item.id, item])).values());
        const uniqueAlbums = Array.from(new Map(albumData.map(item => [item.id, item])).values());
        const uniquePlaylists = Array.from(new Map(playlistData.map(item => [item.id, item])).values());

        setRawSongs(uniqueSongs);
        setAlbums(uniqueAlbums);
        setPlaylists(uniquePlaylists);
      } catch (error) {
        console.error('Unified search failed', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const sortedSongs = useMemo(() => {
    return [...rawSongs].sort((a, b) => {
      const countA = songPopularity[a.id] || 0;
      const countB = songPopularity[b.id] || 0;
      return countB - countA;
    });
  }, [rawSongs, songPopularity]);

  const handleSongClick = (song: Song) => {
    recordSearchSelection(song);
    playTrack(song, sortedSongs);
  };

  return (
    <div className="p-8 pb-32 min-h-full">
      <div className="max-w-xl relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
        <Input
          placeholder="Artists, songs, or playlists"
          className="pl-12 bg-neutral-900 border-none rounded-full h-14 text-xl focus-visible:ring-primary/50 shadow-2xl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {query ? (
        <div className="space-y-16 animate-in fade-in duration-500">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">Songs</h2>
                <p className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">Sorted by your popularity</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={`skeleton-song-${i}`} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
              ) : sortedSongs.length > 0 ? (
                sortedSongs.map((song) => (
                  <div key={`search-song-${song.id}`} onClick={() => handleSongClick(song)}>
                    <SongCard song={song} playlist={sortedSongs} />
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 italic col-span-full">No songs found.</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-neutral-800 p-2 rounded-lg">
                <Disc className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">Albums</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={`skeleton-album-${i}`} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
              ) : albums.length > 0 ? (
                albums.map((album) => (
                  <div key={`search-album-${album.id}`} className="group bg-neutral-900/30 p-5 rounded-2xl transition-all hover:bg-neutral-800/80 border border-white/5 shadow-sm">
                    <div className="relative aspect-square mb-5 rounded-xl overflow-hidden shadow-2xl bg-neutral-900 border border-white/5">
                      {getBestImage(album) ? (
                        <Image src={getBestImage(album)!} alt={album.name} fill className="object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <Disc className="h-16 w-16 text-neutral-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <h3 className="font-bold text-white truncate mb-1">{album.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{getArtistNames(album)}</p>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 italic col-span-full">No albums found.</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-neutral-800 p-2 rounded-lg">
                <ListMusic className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">Playlists</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={`skeleton-playlist-${i}`} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
              ) : playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <div key={`search-playlist-${playlist.id}`} className="group bg-neutral-900/30 p-5 rounded-2xl transition-all hover:bg-neutral-800/80 border border-white/5 shadow-sm">
                    <div className="relative aspect-square mb-5 rounded-xl overflow-hidden shadow-2xl bg-neutral-900 border border-white/5">
                      {getBestImage(playlist) ? (
                        <Image src={getBestImage(playlist)!} alt={playlist.name} fill className="object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <ListMusic className="h-16 w-16 text-neutral-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <h3 className="font-bold text-white truncate mb-1">{playlist.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">Playlist • {playlist.songCount || 'Various'} tracks</p>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 italic col-span-full">No playlists found.</p>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="bg-neutral-900 p-12 rounded-full mb-8 shadow-2xl border border-white/5">
            <Search className="h-20 w-20 text-neutral-800" />
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Start your discovery</h2>
          <p className="text-neutral-500 max-w-sm font-medium">Search for your favorite songs, artists, albums, and playlists in one place.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-500">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
