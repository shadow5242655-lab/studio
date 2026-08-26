'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, History, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview High-fidelity mobile navigation bar.
 * Provides quick access to Home, Explore, Echoes, and Library.
 */

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Explore', icon: Search, href: '/genres' },
    { name: 'Echoes', icon: History, href: '/insights' },
    { name: 'Library', icon: Library, href: '/library' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-[60] md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 px-4 py-1.5 rounded-2xl transition-all duration-300 lag-free-tap",
              isActive ? "text-primary scale-105" : "text-neutral-500 hover:text-white"
            )}
          >
            <item.icon className={cn("h-5 w-5 transition-transform", isActive && "fill-primary/10")} />
            <span className="text-[9px] font-black uppercase tracking-[0.1em] italic text-center leading-none">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
