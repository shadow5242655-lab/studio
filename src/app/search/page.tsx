'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Search, Music, Loader2, Disc, User, ListMusic, ArrowLeft, Play, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Song, searchSongs, searchAlbums, searchArtists, searchPlaylists,
  getBestImage, decodeEntities, formatDuration, getTrending
} from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMusic } from '@/components/music-player/player-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

/**
 * ENHANCED SEARCH PAGE
 *
 * Features:
 * - Tabs: All | Songs | Albums | Playlists | Artists
 * - "All" tab fetches all categories in parallel
 * - Clicking album/playlist/artist shows its songs
 * - Back button to return to search results
 * - Spotify-style layout with red theme
 */

// ============================================================================
// TABS CONFIGURATION
// ============================================================================
const tabs = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'songs', label: 'Songs', icon: Music },
  { id: 'albums', label: 'Albums', icon: Disc },
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
  { id: 'artists', label: 'Artists', icon: User },
];

// ============================================================================
// SEARCH CONTENT COMPONENT
// ============================================================================
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const { playTrack } = useMusic();

  // Search results by category
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Detail view state (when viewing album/playlist/artist songs)
  const [detailView, setDetailView] = useState<{
    type: 'album' | 'playlist' | 'artist';
    name: string;
    image: string | null;
    songs: Song[];
    loading: boolean;
  } | null>(null);

  // Read initial query from URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  // ============================================================================
  // SEARCH LOGIC
  // ============================================================================
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSongs([]);
      setAlbums([]);
      setPlaylists([]);
      setArtists([]);
      return;
    }

    setLoading(true);
    try {
      if (selectedTab === 'all') {
        // Fetch ALL categories in parallel
        const [songsRes, albumsRes, playlistsRes, artistsRes] = await Promise.all([
          searchSongs(searchQuery).catch(() => []),
          searchAlbums(searchQuery).catch(() => []),
          searchPlaylists(searchQuery).catch(() => []),
          searchArtists(searchQuery).catch(() => []),
        ]);
        setSongs(songsRes);
        setAlbums(albumsRes);
        setPlaylists(playlistsRes);
        setArtists(artistsRes);
      } else if (selectedTab === 'songs') {
        const res = await searchSongs(searchQuery);
        setSongs(res);
      } else if (selectedTab === 'albums') {
        const res = await searchAlbums(searchQuery);
        setAlbums(res);
      } else if (selectedTab === 'playlists') {
        const res = await searchPlaylists(searchQuery);
        setPlaylists(res);
      } else if (selectedTab === 'artists') {
        const res = await searchArtists(searchQuery);
        setArtists(res);
      }
    } catch (error) {
      console.error('AYUMUSIC: Search failed', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTab]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Reset detail view when query or tab changes
  useEffect(() => {
    setDetailView(null);
  }, [query, selectedTab]);

  // ============================================================================
  // DETAIL VIEW: Fetch songs for album/playlist/artist
  // ============================================================================
  const openDetailView = useCallback(async (type: 'album' | 'playlist' | 'artist', name: string, image: string | null) => {
    setDetailView({ type, name, image, songs: [], loading: true });
    try {
      // Search for songs by this album/playlist/artist name
      const searchQuery = `${name} ${type === 'artist' ? 'songs' : type === 'album' ? 'songs' : ''}`;
      const results = await searchSongs(searchQuery.trim());
      // Filter to only songs that match the name closely
      const filtered = results.filter(s => {
        const songText = `${s.name} ${s.artists.primary[0]?.name || ''}`.toLowerCase();
        return songText.includes(name.toLowerCase()) || name.toLowerCase().includes(songText.split(' - ')[0]);
      });
      const finalSongs = filtered.length > 0 ? filtered : results.slice(0, 15);
      setDetailView({ type, name, image, songs: finalSongs, loading: false });
    } catch (error) {
      console.error('AYUMUSIC: Detail view fetch failed', error);
      setDetailView({ type, name, image, songs: [], loading: false });
    }
  }, []);

  // ============================================================================
  // RENDER: Detail View (Album/Playlist/Artist songs)
  // ============================================================================
  if (detailView) {
    return (
      <div className="p-6 pb-32 min-h-full max-w-7xl mx-auto bg-[#0a0a0a] text-white animate-in fade-in duration-300">
        {/* Back button */}
        <button
          onClick={() => setDetailView(null)}
          className="flex items-center gap-2 mb-6 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-widest">Back to results</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          {detailView.image ? (
            <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 shrink-0">
              <Image
                src={detailView.image}
                alt={detailView.name}
                fill
                className={cn(
                  "object-cover",
                  detailView.type === 'artist' && "rounded-full"
                )}
                sizes="128px"
              />
            </div>
          ) : (
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-neutral-900 flex items-center justify-center shrink-0">
              {detailView.type === 'album' && <Disc className="h-12 w-12 text-neutral-700" />}
              {detailView.type === 'playlist' && <ListMusic className="h-12 w-12 text-neutral-700" />}
              {detailView.type === 'artist' && <User className="h-12 w-12 text-neutral-700" />}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-1">
              {detailView.type === 'album' ? 'Album' : detailView.type === 'playlist' ? 'Playlist' : 'Artist'}
            </p>
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter truncate">
              {decodeEntities(detailView.name)}
            </h1>
            <p className="text-xs text-neutral-500 mt-1 font-bold uppercase tracking-widest">
              {detailView.songs.length} songs
            </p>
          </div>
        </div>

        {/* Play All button */}
        {detailView.songs.length > 0 && (
          <button
            onClick={() => playTrack(detailView.songs[0], detailView.songs)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-black uppercase italic tracking-tighter text-sm hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(225,29,72,0.3)] mb-8"
          >
            <Play className="h-4 w-4 fill-current" /> Play All
          </button>
        )}

        {/* Song list */}
        {detailView.loading ? (
          <div className="space-y-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-900 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : detailView.songs.length > 0 ? (
          <div className="space-y-2">
            {detailView.songs.map((song, idx) => (
              <div
                key={`${song.id}-${idx}`}
                onClick={() => playTrack(song, detailView.songs)}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <span className="w-6 text-center text-[10px] font-black text-neutral-600 shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                  <img src={getBestImage(song) || ''} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="h-4 w-4 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate italic uppercase tracking-tight">
                    {decodeEntities(song.name)}
                  </p>
                  <p className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest">
                    {song.artists.primary[0]?.name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock className="h-3 w-3 text-neutral-600" />
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-neutral-500 italic text-sm font-bold uppercase tracking-widest">
              No songs found for this {detailView.type}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER: Main Search View
  // ============================================================================
  return (
    <div className="p-6 pb-32 min-h-full max-w-7xl mx-auto bg-[#0a0a0a] text-white">
      {/* Search Bar */}
      <div className="max-w-2xl relative mb-6">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
        <Input
          placeholder="Search for songs, albums, artists, playlists..."
          className="pl-14 bg-[#1a1a1a] border-none rounded-2xl h-14 text-base focus-visible:ring-primary/50 shadow-xl transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {loading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0",
              selectedTab === tab.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-white/5 text-neutral-500 hover:text-white hover:bg-white/10"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {query ? (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* ALL TAB: Show sections for each category */}
          {selectedTab === 'all' && (
            <>
              {/* Songs Section */}
              {songs.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tighter">Songs</h2>
                    <button
                      onClick={() => setSelectedTab('songs')}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      See all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {songs.slice(0, 10).map((song) => (
                      <SongCard key={`all-song-${song.id}`} song={song} playlist={songs} />
                    ))}
                  </div>
                </section>
              )}

              {/* Albums Section */}
              {albums.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tighter">Albums</h2>
                    <button
                      onClick={() => setSelectedTab('albums')}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      See all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {albums.slice(0, 10).map((album) => (
                      <div
                        key={`all-album-${album.id}`}
                        onClick={() => openDetailView('album', album.name, getBestImage(album))}
                        className="group glass-card p-4 rounded-2xl transition-all hover:bg-white/10 cursor-pointer"
                      >
                        <div className="relative aspect-square mb-3 rounded-xl overflow-hidden shadow-2xl bg-neutral-900">
                          {getBestImage(album) ? (
                            <Image
                              src={getBestImage(album)!}
                              alt={album.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-110"
                              sizes="(max-width: 768px) 50vw, 200px"
                            />
                          ) : (
                            <Disc className="h-12 w-12 text-neutral-800 m-auto mt-8" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="h-8 w-8 text-white fill-current" />
                          </div>
                        </div>
                        <h3 className="font-bold text-xs text-white truncate uppercase italic tracking-tight">
                          {decodeEntities(album.name)}
                        </h3>
                        <p className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest">
                          {album.artists?.[0]?.name || 'Album'}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Artists Section */}
              {artists.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tighter">Artists</h2>
                    <button
                      onClick={() => setSelectedTab('artists')}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      See all
                    </button>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {artists.slice(0, 12).map((artist) => (
                      <div
                        key={`all-artist-${artist.id}`}
                        onClick={() => openDetailView('artist', artist.name, getBestImage(artist))}
                        className="group flex flex-col items-center text-center cursor-pointer"
                      >
                        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-2xl bg-neutral-900 mb-3 border-2 border-transparent group-hover:border-primary transition-colors">
                          {getBestImage(artist) ? (
                            <Image
                              src={getBestImage(artist)!}
                              alt={artist.name}
                              fill
                              className="object-cover"
                              sizes="128px"
                            />
                          ) : (
                            <User className="h-12 w-12 text-neutral-800 m-auto mt-6" />
                          )}
                        </div>
                        <p className="font-bold text-xs text-white truncate uppercase italic tracking-tight max-w-[120px]">
                          {decodeEntities(artist.name)}
                        </p>
                        <p className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">
                          Artist
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Playlists Section */}
              {playlists.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tighter">Playlists</h2>
                    <button
                      onClick={() => setSelectedTab('playlists')}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      See all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {playlists.slice(0, 10).map((pl) => (
                      <div
                        key={`all-pl-${pl.id}`}
                        onClick={() => openDetailView('playlist', pl.name, getBestImage(pl))}
                        className="group glass-card p-4 rounded-2xl transition-all hover:bg-white/10 cursor-pointer"
                      >
                        <div className="relative aspect-square mb-3 rounded-xl overflow-hidden shadow-2xl bg-neutral-900">
                          {getBestImage(pl) ? (
                            <Image
                              src={getBestImage(pl)!}
                              alt={pl.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-110"
                              sizes="(max-width: 768px) 50vw, 200px"
                            />
                          ) : (
                            <ListMusic className="h-12 w-12 text-neutral-800 m-auto mt-8" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="h-8 w-8 text-white fill-current" />
                          </div>
                        </div>
                        <h3 className="font-bold text-xs text-white truncate uppercase italic tracking-tight">
                          {decodeEntities(pl.name)}
                        </h3>
                        <p className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest">
                          {pl.user?.username || 'Playlist'}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Loading state */}
              {loading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array(8).fill(0).map((_, i) => (
                    <div key={`skeleton-${i}`} className="space-y-3">
                      <Skeleton className="aspect-square w-full rounded-2xl bg-[#1a1a1a]" />
                      <Skeleton className="h-3 w-3/4 bg-[#1a1a1a]" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* INDIVIDUAL TABS */}
          {selectedTab === 'songs' && (
            <section>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {loading ? (
                  Array(10).fill(0).map((_, i) => (
                    <div key={`sk-song-${i}`} className="space-y-3">
                      <Skeleton className="aspect-square w-full rounded-2xl bg-[#1a1a1a]" />
                      <Skeleton className="h-3 w-3/4 bg-[#1a1a1a]" />
                    </div>
                  ))
                ) : songs.length > 0 ? (
                  songs.map((song) => (
                    <SongCard key={`tab-song-${song.id}`} song={song} playlist={songs} />
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <p className="text-neutral-500 italic text-sm font-bold uppercase tracking-widest">No songs found</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {selectedTab === 'albums' && (
            <section>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {loading ? (
                  Array(10).fill(0).map((_, i) => (
                    <div key={`sk-album-${i}`} className="space-y-3">
                      <Skeleton className="aspect-square w-full rounded-2xl bg-[#1a1a1a]" />
                      <Skeleton className="h-3 w-3/4 bg-[#1a1a1a]" />
                    </div>
                  ))
                ) : albums.length > 0 ? (
                  albums.map((album) => (
                    <div
                      key={`tab-album-${album.id}`}
                      onClick={() => openDetailView('album', album.name, getBestImage(album))}
                      className="group glass-card p-4 rounded-2xl transition-all hover:bg-white/10 cursor-pointer"
                    >
                      <div className="relative aspect-square mb-3 rounded-xl overflow-hidden shadow-2xl bg-neutral-900">
                        {getBestImage(album) ? (
                          <Image src={getBestImage(album)!} alt={album.name} fill className="object-cover transition-transform group-hover:scale-110" sizes="(max-width: 768px) 50vw, 200px" />
                        ) : (
                          <Disc className="h-12 w-12 text-neutral-800 m-auto mt-8" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="h-8 w-8 text-white fill-current" />
                        </div>
                      </div>
                      <h3 className="font-bold text-xs text-white truncate uppercase italic tracking-tight">{decodeEntities(album.name)}</h3>
                      <p className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest">{album.artists?.[0]?.name || 'Album'}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <p className="text-neutral-500 italic text-sm font-bold uppercase tracking-widest">No albums found</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {selectedTab === 'playlists' && (
            <section>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {loading ? (
                  Array(10).fill(0).map((_, i) => (
                    <div key={`sk-pl-${i}`} className="space-y-3">
                      <Skeleton className="aspect-square w-full rounded-2xl bg-[#1a1a1a]" />
                      <Skeleton className="h-3 w-3/4 bg-[#1a1a1a]" />
                    </div>
                  ))
                ) : playlists.length > 0 ? (
                  playlists.map((pl) => (
                    <div
                      key={`tab-pl-${pl.id}`}
                      onClick={() => openDetailView('playlist', pl.name, getBestImage(pl))}
                      className="group glass-card p-4 rounded-2xl transition-all hover:bg-white/10 cursor-pointer"
                    >
                      <div className="relative aspect-square mb-3 rounded-xl overflow-hidden shadow-2xl bg-neutral-900">
                        {getBestImage(pl) ? (
                          <Image src={getBestImage(pl)!} alt={pl.name} fill className="object-cover transition-transform group-hover:scale-110" sizes="(max-width: 768px) 50vw, 200px" />
                        ) : (
                          <ListMusic className="h-12 w-12 text-neutral-800 m-auto mt-8" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="h-8 w-8 text-white fill-current" />
                        </div>
                      </div>
                      <h3 className="font-bold text-xs text-white truncate uppercase italic tracking-tight">{decodeEntities(pl.name)}</h3>
                      <p className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest">{pl.user?.username || 'Playlist'}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <p className="text-neutral-500 italic text-sm font-bold uppercase tracking-widest">No playlists found</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {selectedTab === 'artists' && (
            <section>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {loading ? (
                  Array(12).fill(0).map((_, i) => (
                    <div key={`sk-artist-${i}`} className="flex flex-col items-center gap-3">
                      <Skeleton className="w-24 h-24 rounded-full bg-[#1a1a1a]" />
                      <Skeleton className="h-3 w-16 bg-[#1a1a1a]" />
                    </div>
                  ))
                ) : artists.length > 0 ? (
                  artists.map((artist) => (
                    <div
                      key={`tab-artist-${artist.id}`}
                      onClick={() => openDetailView('artist', artist.name, getBestImage(artist))}
                      className="group flex flex-col items-center text-center cursor-pointer"
                    >
                      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-2xl bg-neutral-900 mb-3 border-2 border-transparent group-hover:border-primary transition-colors">
                        {getBestImage(artist) ? (
                          <Image src={getBestImage(artist)!} alt={artist.name} fill className="object-cover" sizes="128px" />
                        ) : (
                          <User className="h-12 w-12 text-neutral-800 m-auto mt-6" />
                        )}
                      </div>
                      <p className="font-bold text-xs text-white truncate uppercase italic tracking-tight max-w-[120px]">{decodeEntities(artist.name)}</p>
                      <p className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">Artist</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <p className="text-neutral-500 italic text-sm font-bold uppercase tracking-widest">No artists found</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
          <div className="bg-[#1a1a1a] p-10 rounded-full mb-6 border border-white/5">
            <Search className="h-16 w-16 text-neutral-800" />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-3">Discovery Engine</h2>
          <p className="text-neutral-500 max-w-sm font-medium uppercase tracking-tight text-xs">
            Search for songs, albums, artists, or playlists to explore.
          </p>
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
