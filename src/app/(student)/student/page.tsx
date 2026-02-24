import { Suspense } from "react";
import { Button } from "../../../components/ui/button";
import StudentFilters from "../../../components/student-filters";
import DocumentList, { DocumentListSkeleton } from "../../../components/document-list";
import { CATEGORIES, LEVELS, GRADES_PRIMARY, GRADES_SECONDARY } from "../../../lib/data/mock";
import { createClient } from "../../../lib/supabase/server";
import { buildConnectedUser } from "../../../lib/user/connected-user";

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const connectedUser = buildConnectedUser(user, profile);
  const displayName = connectedUser.displayName;

  const rawGradeOptions = params.level === "Primaire" ? GRADES_PRIMARY : 
                          params.level === "Secondaire" ? GRADES_SECONDARY : 
                          [...GRADES_PRIMARY, ...GRADES_SECONDARY];
  
  // Deduplicate keys for React
  const gradeOptions = Array.from(new Set(rawGradeOptions));

  return (
    <div className="container py-8 space-y-10">
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Bonjour{displayName ? `, ${displayName}` : ""} <span role="img" aria-label="wave">👋</span>
          </h1>
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
          <Suspense key={JSON.stringify(params)} fallback={<DocumentListSkeleton />}>
            <DocumentList params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
