
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, ShoppingBag, Heart, Scissors, Ruler, Loader2 } from "lucide-react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateProductDescription } from "@/ai/flows/product-description-generator";

interface ProductModalProps {
  garment: any;
}

export function ProductModal({ garment }: ProductModalProps) {
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateStory = async () => {
    setIsLoading(true);
    try {
      const result = await generateProductDescription({
        garmentName: garment.description,
        fabricType: "Pure Silk",
        craftsmanship: "Hand-loomed with Zari border",
        materialOrigin: "Banaras, India",
        occasion: "Festive Ceremony",
      });
      setAiDescription(result.description);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger value="details">Specifications</TabsTrigger>
              <TabsTrigger value="story">The Story</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-4 space-y-4">
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
              <p className="text-sm text-muted-foreground leading-relaxed">
                Experience the fine drape and breathability of our premium hand-loomed textiles. 
                Each piece is crafted with attention to weight and weave integrity.
              </p>
            </TabsContent>
            <TabsContent value="story" className="pt-4 min-h-[150px]">
              {aiDescription ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm italic text-muted-foreground leading-relaxed">
                    {aiDescription}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setAiDescription(null)} className="text-xs h-8">
                    Reset Story
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Discover the Craft</h4>
                    <p className="text-xs text-muted-foreground mt-1">Let our AI tell the unique story of this garment's heritage.</p>
                  </div>
                  <Button 
                    onClick={handleGenerateStory} 
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate Story
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

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
