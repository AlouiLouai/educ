"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

interface FilterProps {
  categories: string[];
  levels: string[];
  gradeOptions: string[];
}

export default function StudentFilters({ categories, levels, gradeOptions }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "Tous") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push("/student", { scroll: false });
    });
  };

  const currentCategory = searchParams.get("category") || "Tous";
  const currentLevel = searchParams.get("level") || "Tous";
  const currentGrade = searchParams.get("grade") || "Tous";

  return (
    <aside className={`space-y-5 rounded-2xl border border-black/5 bg-white p-5 shadow-soft lg:sticky lg:top-24 lg:self-start ${isPending ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Filtres</p>
        <button type="button" className="text-xs text-primary hover:underline" onClick={clearFilters}>
          Effacer
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Niveau</p>
        <div className="flex flex-wrap gap-2">
          {levels.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={currentLevel === item ? "primary" : "ghost"}
              onClick={() => updateFilter("level", item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Classe</p>
        <select
          className="w-full rounded-full border border-black/10 bg-white px-3 py-2 text-sm"
          value={currentGrade}
          onChange={(e) => updateFilter("grade", e.target.value)}
        >
          <option value="Tous">Toutes</option>
          {gradeOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Matière</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={currentCategory === cat ? "primary" : "ghost"}
              size="sm"
              onClick={() => updateFilter("category", cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}
