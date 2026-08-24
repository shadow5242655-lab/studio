
"use client";

import React from "react";
import { Scissors, ShoppingBag } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { CartDrawer } from "./cart-drawer";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md px-6 py-4 border-white/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Scissors className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-sm md:text-xl font-black tracking-tighter text-white uppercase italic">
            AYUMUSIC <span className="text-primary">Boutique</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#collection" className="hover:text-primary transition-colors">Collection</a>
            <a href="#consultant" className="hover:text-primary transition-colors">Stylist</a>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                <ShoppingBag className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <CartDrawer />
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
