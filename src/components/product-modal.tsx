
"use client";

import React from "react";
import Image from "next/image";
import { ShoppingBag, Heart, Scissors, Ruler, Sparkles } from "lucide-react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductModalProps {
  garment: any;
}

export function ProductModal({ garment }: ProductModalProps) {
  return (
    <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-none">
      <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
        <div className="relative w-full md:w-1/2 aspect-[4/5] bg-secondary overflow-hidden">
          <Image 
            src={garment.imageUrl} 
            alt={garment.description} 
            fill 
            className="object-cover transition-transform duration-500 hover:scale-125 cursor-zoom-in"
          />
        </div>
        
        <div className="w-full md:w-1/2 p-8 flex flex-col gap-6 overflow-y-auto">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">Limited Edition</Badge>
              <Badge variant="outline" className="border-accent/30 text-accent">Artisanal</Badge>
            </div>
            <DialogTitle className="text-3xl font-headline leading-tight">{garment.description}</DialogTitle>
            <p className="text-xl font-bold text-primary">₹3,499.00</p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Scissors className="h-4 w-4 text-primary" />
                <span className="text-sm">Hand-tailored</span>
              </div>
              <div className="flex items-center gap-3">
                <Ruler className="h-4 w-4 text-primary" />
                <span className="text-sm">Regular Fit</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">Natural Dyes</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-xs">Origin:</span>
                <span className="text-sm">Local Artisans</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed border-t pt-4">
              Experience the fine drape and breathability of our premium hand-loomed textiles. 
              Each piece is crafted with attention to weight and weave integrity, bringing the best of tradition to your wardrobe.
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <Button className="w-full py-6 text-lg group">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Collection
            </Button>
            <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
              <Heart className="mr-2 h-5 w-5" />
              Save to Wishlist
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
