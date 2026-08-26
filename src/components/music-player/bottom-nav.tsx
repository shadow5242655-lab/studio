'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, History, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview High-fidelity mobile navigation bar pinned at the absolute bottom.
 * Perfectly matched to the user's provided screenshot.
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
    <nav className="h-18 bg-black border-t border-white/5 flex items-center shrink-0 w-full relative z-[100] pb-6 px-6 select-none safe-area-bottom">
      <div className="flex w-full items-center justify-between gap-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 flex-1 py-2",
                isActive ? "text-primary" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <item.icon className={cn("h-6 w-6 transition-transform", isActive && "text-primary scale-110")} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tight italic text-center",
                isActive ? "text-primary" : "text-neutral-500"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
