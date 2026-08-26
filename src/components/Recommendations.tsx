"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Song = {
  id: string;
  title?: string;
  artist?: string;
  genres?: string[] | string;
  coverUrl?: string;
  score?: number;
};

export default function Recommendations({ userId }: { userId: string }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!mounted) return;
        setSongs(
          (data.recommendations || []).map((s: any) => ({
            id: s.id,
            title: s.title || s.name || "Untitled",
            artist: s.artist || "Unknown artist",
            genres: s.genres || s.genre || [],
            coverUrl: s.coverUrl || s.cover || s.artwork || s.image || "",
            score: typeof s.score === "number" ? s.score : undefined,
          }))
        );
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (userId) load();
    else {
      setSongs([]);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (loading) {
    return <div className="py-8 text-center">Loading recommendations…</div>;
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-600">Error loading recommendations: {error}</div>
    );
  }

  if (!songs || songs.length === 0) {
    return <div className="py-8 text-center">No recommendations available.</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {songs.map((song) => (
          <div
            key={song.id}
            className="relative bg-white/5 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="relative h-40 w-full bg-gray-100 dark:bg-gray-800"
              style={{ aspectRatio: "1 / 1" }}
            >
              {song.coverUrl ? (
                <Image
                  src={song.coverUrl}
                  alt={`${song.title} cover`}
                  fill
                  sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-500">
                  No cover
                </div>
              )}

              {/* Hover overlay with play button */}
              <button
                onClick={() => router.push(`/player/${song.id}`)}
                aria-label={`Play ${song.title}`}
                className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors"
              >
                <span className="opacity-0 hover:opacity-100 transform hover:scale-105 transition-all">
                  <div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-6.518-3.76A1 1 0 007 8.236v7.528a1 1 0 001.234.97l6.518-1.88A1 1 0 0016 14.996V12.8a1 1 0 00-1.248-.632z" />
                    </svg>
                  </div>
                </span>
              </button>
            </div>

            <div className="p-3">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {song.title}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">{song.artist}</div>

              <div className="mt-2 flex flex-wrap gap-2">
                {((Array.isArray(song.genres) ? song.genres : String(song.genres).split(",")) || [])
                  .slice(0, 3)
                  .map((g, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full"
                    >
                      {String(g).trim()}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
