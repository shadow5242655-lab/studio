"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingBag, Menu, Scissors } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { CartDrawer } from "./cart-drawer";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

export function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<typeof PlaceHolderImages>([]);

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const filtered = PlaceHolderImages.filter(img => 
        img.description.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 4);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-headline font-bold tracking-tight text-primary sm:text-2xl">
            SHIV CLOTHES HOUSE AND GARMENTS
          </h1>
        </div>

        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search fabrics, weaves, styles..."
              className="pl-10 bg-secondary/50 border-none focus-visible:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full rounded-md border bg-card p-2 shadow-xl">
              {suggestions.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-sm cursor-pointer transition-colors">
                  <div className="relative h-10 w-10 overflow-hidden rounded bg-secondary">
                    <Image src={item.imageUrl} alt={item.description} fill className="object-cover" />
                  </div>
                  <span className="text-sm truncate">{item.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-secondary">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  3
                </span>
              </Button>
            </SheetTrigger>
            <CartDrawer />
          </Sheet>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
