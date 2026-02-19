import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import StudentFilters from "../../../components/student-filters";
import { ALL_DOCUMENTS, CATEGORIES, LEVELS, GRADES_PRIMARY, GRADES_SECONDARY } from "../../../lib/data/mock";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    level?: string;
    grade?: string;
    search?: string;
  }>;
}

export default async function StudentDashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Filtering Logic on the SERVER
  const filteredDocs = ALL_DOCUMENTS.filter((doc) => {
    if (params.category && params.category !== "Tous" && doc.tag !== params.category) return false;
    if (params.level && params.level !== "Tous" && doc.level !== params.level) return false;
    if (params.grade && params.grade !== "Tous" && doc.grade !== params.grade) return false;
    if (params.search && !doc.title.toLowerCase().includes(params.search.toLowerCase())) return false;
    return true;
  });

  const rawGradeOptions = params.level === "Primaire" ? GRADES_PRIMARY : 
                          params.level === "Secondaire" ? GRADES_SECONDARY : 
                          [...GRADES_PRIMARY, ...GRADES_SECONDARY];
  
  // Deduplicate keys for React
  const gradeOptions = Array.from(new Set(rawGradeOptions));

  return (
    <div className="container py-8 space-y-10">
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bonjour, Louai 👋</h1>
          <p className="text-muted-foreground text-lg">Prêt pour une nouvelle séance d'apprentissage ?</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">Crédits: 45 TND</p>
          </div>
          <Button>Recharger</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <StudentFilters 
          categories={CATEGORIES} 
          levels={LEVELS} 
          gradeOptions={gradeOptions} 
        />

        <div className="space-y-4">
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
          {filteredDocs.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl">
              <p className="text-muted-foreground">Aucun document ne correspond à vos filtres.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
