
"use client";

import React, { useState } from "react";
import { Sparkles, Search, Loader2, ArrowRight, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { garmentRecommendation, GarmentRecommendationOutput } from "@/ai/flows/garment-recommendation";

export function CurationConsultant() {
  const [occasion, setOccasion] = useState<string>("");
  const [fabrics, setFabrics] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<GarmentRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const occasions = ["Wedding", "Festive Gathering", "Casual Brunch", "Business Formal", "Evening Gala"];
  const fabricOptions = ["Silk", "Linen", "Cotton Weave", "Khadi", "Velvet"];

  const handleCuration = async () => {
    if (!occasion || fabrics.length === 0) return;
    setIsLoading(true);
    try {
      const result = await garmentRecommendation({
        fabricTypes: fabrics,
        occasion: occasion
      });
      setRecommendations(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFabric = (fabric: string) => {
    setFabrics(prev => prev.includes(fabric) ? prev.filter(f => f !== fabric) : [...prev, fabric]);
  };

  return (
    <section className="py-20 border-t border-primary/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
              <Sparkles className="h-3 w-3" />
              AI Style Consultant
            </div>
            <h2 className="text-4xl font-headline leading-tight">Personalized <span className="text-primary italic">Curation</span></h2>
            <p className="text-muted-foreground leading-relaxed">
              Experience Bespoke AI recommendations. Select your preferred fabrics and the upcoming occasion, 
              and let our consultant build your perfect ensemble.
            </p>
          </div>

          <Card className="border-primary/20 shadow-2xl bg-secondary/20">
            <CardHeader>
              <CardTitle className="text-lg">Style Preferences</CardTitle>
              <CardDescription>Tell us what you're looking for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Occasion</label>
                <Select onValueChange={setOccasion}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="What's the event?" />
                  </SelectTrigger>
                  <SelectContent>
                    {occasions.map(occ => (
                      <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Fabrics</label>
                <div className="flex flex-wrap gap-2">
                  {fabricOptions.map(fabric => (
                    <Badge
                      key={fabric}
                      variant={fabrics.includes(fabric) ? "default" : "outline"}
                      className="cursor-pointer py-2 px-4 rounded-sm transition-all hover:scale-105"
                      onClick={() => toggleFabric(fabric)}
                    >
                      {fabric}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full py-6 gap-2" 
                onClick={handleCuration}
                disabled={isLoading || !occasion || fabrics.length === 0}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Curate My Look
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 min-h-[400px]">
          {recommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
              {recommendations.recommendations.map((rec, idx) => (
                <Card key={idx} className="bg-card border-none shadow-xl overflow-hidden group">
                  <div className="relative h-48 bg-secondary">
                    <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                      <Shirt className="h-24 w-24" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary/90">{rec.type}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h4 className="font-headline text-xl group-hover:text-primary transition-colors">{rec.name}</h4>
                      <p className="text-xs text-muted-foreground">{rec.fabric}</p>
                    </div>
                    <p className="text-sm line-clamp-2 text-muted-foreground leading-relaxed">{rec.description}</p>
                    <div className="pt-2 border-t text-[11px] space-y-2">
                      <p className="font-bold text-accent italic">" {rec.matchingReason} "</p>
                      <p className="text-muted-foreground uppercase tracking-widest font-bold">Styling: {rec.stylingTips}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-primary/10 rounded-sm">
              <div className="p-6 rounded-full bg-primary/5 mb-6">
                <Shirt className="h-12 w-12 text-primary/20" />
              </div>
              <h3 className="text-xl font-headline mb-2 text-muted-foreground">Waiting for your preferences</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your personalized style curation will appear here once you select your fabrics and occasion.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
