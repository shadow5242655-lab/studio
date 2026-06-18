
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = {
  Material: ["Silk", "Cotton", "Linen", "Wool", "Muslin"],
  Weave: ["Hand-loomed", "Jacquard", "Zari", "Twill", "Plain"],
  Occasion: ["Festive", "Wedding", "Casual", "Formal", "Heritage"],
};

export function CategoryExplorer() {
  const [activeFilters, setActiveFilters] = useState<string[]>(["All"]);

  const toggleFilter = (filter: string) => {
    if (filter === "All") {
      setActiveFilters(["All"]);
      return;
    }
    const newFilters = activeFilters.filter((f) => f !== "All");
    if (newFilters.includes(filter)) {
      const updated = newFilters.filter((f) => f !== filter);
      setActiveFilters(updated.length === 0 ? ["All"] : updated);
    } else {
      setActiveFilters([...newFilters, filter]);
    }
  };

  return (
    <div className="w-full py-8 space-y-6">
      <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
        <Button
          variant={activeFilters.includes("All") ? "default" : "secondary"}
          size="sm"
          className="rounded-full px-6"
          onClick={() => toggleFilter("All")}
        >
          All Collections
        </Button>
        {Object.entries(categories).map(([group, options]) => (
          <div key={group} className="flex items-center gap-2 border-l pl-4 shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{group}:</span>
            {options.map((opt) => (
              <Button
                key={opt}
                variant={activeFilters.includes(opt) ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-full px-4 text-xs h-8",
                  activeFilters.includes(opt) ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
                )}
                onClick={() => toggleFilter(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <Badge key={filter} variant="outline" className="border-primary/30 text-primary py-1 px-3">
            {filter} {filter !== "All" && "×"}
          </Badge>
        ))}
      </div>
    </div>
  );
}
