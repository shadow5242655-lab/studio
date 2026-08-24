'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Search, Library, PlusSquare, Heart, Music2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Search', icon: Search, href: '/search' },
    { name: 'Your Library', icon: Library, href: '/library' },
  ];

  return (
    <div className="w-64 bg-black flex flex-col gap-2 p-2 h-full border-r border-white/5">
      <div className="p-4 mb-2">
        <Link href="/" className="flex items-center gap-2 text-[#1ed760]">
          <Music2 className="h-8 w-8" />
          <span className="font-bold text-xl tracking-tight text-white">Spotify</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-md text-sm font-bold transition-all hover:text-white",
              pathname === item.href ? "text-white bg-white/10" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-6 w-6" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-1">
        <button className="flex items-center gap-4 px-4 py-3 rounded-md text-sm font-bold text-muted-foreground hover:text-white transition-all">
          <div className="bg-white/70 text-black p-1 rounded-sm">
            <PlusSquare className="h-4 w-4" />
          </div>
          Create Playlist
        </button>
        <button className="flex items-center gap-4 px-4 py-3 rounded-md text-sm font-bold text-muted-foreground hover:text-white transition-all">
          <div className="bg-gradient-to-br from-indigo-700 to-blue-300 text-white p-1 rounded-sm">
            <Heart className="h-4 w-4 fill-white" />
          </div>
          Liked Songs
        </button>
      </div>

      <div className="mt-auto p-4 border-t border-white/5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Legal • Privacy • Cookies</p>
      </div>
    </div>
  );
}