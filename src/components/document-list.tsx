import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ALL_DOCUMENTS } from "../lib/data/mock";

interface DocumentListProps {
  params: {
    category?: string;
    level?: string;
    grade?: string;
    search?: string;
  };
}

export default async function DocumentList({ params }: DocumentListProps) {
  // Simulate database delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const filteredDocs = ALL_DOCUMENTS.filter((doc) => {
    if (params.category && params.category !== "Tous" && doc.tag !== params.category) return false;
    if (params.level && params.level !== "Tous" && doc.level !== params.level) return false;
    if (params.grade && params.grade !== "Tous" && doc.grade !== params.grade) return false;
    if (params.search && !doc.title.toLowerCase().includes(params.search.toLowerCase())) return false;
    return true;
  });

  if (filteredDocs.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-3xl">
        <p className="text-muted-foreground">Aucun document ne correspond à vos filtres.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredDocs.map((doc) => (
        <Card key={doc.title} className="group overflow-hidden border-black/5 transition-all hover:shadow-xl">
          <div className="aspect-[5/3] bg-muted relative overflow-hidden">
             <img src={doc.image} alt={doc.title} className="object-cover w-full h-full opacity-80" />
             <div className="absolute top-3 right-3">
               <Badge className="bg-white/90 backdrop-blur text-ink">{doc.tag}</Badge>
             </div>
          </div>
          <CardContent className="p-3 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-primary">★ {doc.rating}</span>
                <span className="text-xs text-muted-foreground">{doc.grade}</span>
              </div>
              <h3 className="font-semibold leading-tight">{doc.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{doc.teacher}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-black/5">
              <span className="font-bold">{doc.price} TND</span>
              <Button size="sm">Acheter</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DocumentListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-black/5">
          <Skeleton className="aspect-[5/3] w-full" />
          <CardContent className="p-3 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-black/5">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { Skeleton } from "./ui/skeleton";
