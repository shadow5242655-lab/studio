'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Song, getCuratedPlaylists, getPlaylistSongs, getBestImage, decodeEntities } from '@/lib/music-api';
import { Play, Loader2, ListMusic } from 'lucide-react';
import { useMusic } from '@/components/music-player/player-context';

/**
 * FreshPlaylists — Horizontal scrollable playlist cards section.
 * 
 * Fetches curated playlists from JioSaavn API and displays them
 * as horizontal scroll cards with cover art, title, song count, and play button.
 * Clicking a card fetches the playlist's songs and starts playback.
 */
export default function FreshPlaylists() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(null);
  const { playTrack } = useMusic();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    // Curated queries matching JioSaavn's editorial playlists
    const curatedQueries = [
      'India Superhits Top 50',
      'Bollywood Top 50',
      'Viral Nation',
      'Punjabi Top 50',
      'International Top 50',
      'Bengali Top 50',
      'Tamil Top 50',
      'Chartbusters 2026',
      'Romance Hits',
      'Party Anthems',
    ];

    getCuratedPlaylists(curatedQueries)
      .then(results => {
        if (mounted) {
          // Limit to 20 playlists and ensure unique IDs
          const unique = results.slice(0, 20);
          setPlaylists(unique);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const handlePlayPlaylist = async (playlist: any) => {
    if (loadingPlaylistId) return; // Prevent multiple concurrent loads

    setLoadingPlaylistId(playlist.id);
    try {
      const songs = await getPlaylistSongs(playlist.id);
      if (songs.length > 0) {
        playTrack(songs[0], songs);
      }
    } catch (e) {
      console.error('AYUMUSIC: Failed to load playlist', e);
    } finally {
      setLoadingPlaylistId(null);
    }
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="h-6 w-40 bg-neutral-900 animate-pulse rounded ml-6" />
        <div className="flex gap-4 overflow-hidden px-6 pb-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 h-40 bg-neutral-900 animate-pulse rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (playlists.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="px-6">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
          Fresh Playlists
        </h2>
        <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-0.5">
          Editorial picks for every mood
        </p>
      </div>

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4 scroll-smooth"
      >
        {playlists.map((playlist) => {
          const imageUrl = getBestImage(playlist);
          const isLoading = loadingPlaylistId === playlist.id;

          return (
            <div
              key={playlist.id}
              className="flex-shrink-0 w-40 group cursor-pointer"
              onClick={() => handlePlayPlaylist(playlist)}
            >
              {/* Playlist Cover */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 mb-2 shadow-lg">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={playlist.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ListMusic className="h-10 w-10 text-neutral-700" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <Play className="h-5 w-5 text-white fill-current ml-0.5" />
                    </div>
                  )}
                </div>

                {/* JioSaavn badge */}
                <div className="absolute top-2 left-2">
                  <div className="bg-[#00c853]/90 rounded-full p-1">
                    <svg viewBox="0 0 24 24" className="h-3 w-3 text-white fill-current">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Playlist Info */}
              <p className="text-[10px] font-bold text-white truncate uppercase italic tracking-tight">
                {playlist.name.length > 25 ? playlist.name.substring(0, 25) + '...' : decodeEntities(playlist.name)}
              </p>
              <p className="text-[8px] text-neutral-500 truncate uppercase font-black tracking-widest">
                {playlist.songCount ? `${playlist.songCount} songs` : 'JioSaavn'}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
