'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, History, Library, Disc } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview High-fidelity navigation bar restored to match the requested image lineage.
 */

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'HOME', icon: Home, href: '/' },
    { name: 'EXPLORE', icon: Search, href: '/genres' },
    { name: 'ECHOES', icon: History, href: '/insights' },
    { name: 'LIBRARY', icon: Library, href: '/library' },
  ];

  return (
    <nav className="h-20 bg-black border-t border-white/5 flex items-center shrink-0 z-[60] pb-2">
      <div className="flex w-full max-w-7xl mx-auto justify-around px-4">
        {/* Ayumusik Logo Node */}
        <div className="flex flex-col items-center gap-1.5 opacity-20">
          <div className="h-8 w-8 rounded-full border border-white flex items-center justify-center">
            <span className="font-black text-xs text-white">N</span>
          </div>
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 px-4 transition-all duration-300 lag-free-tap",
                isActive ? "text-primary" : "text-neutral-500 hover:text-white"
              )}
            >
              <item.icon className={cn("h-6 w-6 transition-transform", isActive && "fill-primary/10")} />
              <span className="text-[9px] font-black uppercase tracking-[0.1em] italic text-center leading-none">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
