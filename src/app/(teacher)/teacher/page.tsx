"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { cn } from "../../../components/utils";
import { UploadDocumentForm } from "../../../components/teacher/upload-document-form";
import { createClient } from "../../../lib/supabase/browser";
import { useAuth } from "../../../hooks/use-auth";

const stats = [
  // ... (stats remains the same)
  {
    label: "Ventes totales",
    value: "1,482",
    trend: "+12%",
    color: "primary",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 7h16M6 12h12M9 17h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Séries actives",
    value: "18",
    trend: "+3",
    color: "accent",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 6h16v12H4z" strokeLinecap="round" />
        <path d="M9 10h6M9 14h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Revenu (Fév)",
    value: "2 450 TND",
    trend: "+8%",
    color: "success",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3v18M7 7h7a3 3 0 1 1 0 6H8a3 3 0 1 0 0 6h9" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Note globale",
    value: "4,9/5",
    trend: "Top 1%",
    color: "warning",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3l2.6 5.4 6 .8-4.4 4.2 1.1 6-5.3-2.8-5.3 2.8 1.1-6L3.4 9.2l6-.8L12 3z" strokeLinecap="round" />
      </svg>
    ),
  },
];

const uploads = [
  {
    title: "Série Fondations Maths",
    grade: "4e année",
    buyers: 328,
    revenue: "3,936 TND",
    status: "En ligne",
    statusKey: "success",
    updated: "15 Fév 2026",
  },
  {
    title: "Boîte à outils d'écriture",
    grade: "6e année",
    buyers: 214,
    revenue: "2,140 TND",
    status: "En ligne",
    statusKey: "success",
    updated: "08 Fév 2026",
  },
  {
    title: "Pack Labos Sciences",
    grade: "8e année",
    buyers: 187,
    revenue: "3,366 TND",
    status: "En revue",
    statusKey: "warning",
    updated: "14 Fév 2026",
  },
  {
    title: "Sprint Prépa Exam",
    grade: "9e année",
    buyers: 0,
    revenue: "0 TND",
    status: "Brouillon",
    statusKey: "muted",
    updated: "15 Fév 2026",
  },
];

const revenueData = [
  { month: "Sep", val: 40 },
  { month: "Oct", val: 65 },
  { month: "Nov", val: 55 },
  { month: "Déc", val: 80 },
  { month: "Jan", val: 95 },
  { month: "Fév", val: 75 },
];

export default function TeacherDashboard() {
  const { connectedUser } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createClient();

  async function fetchDocuments() {
    if (!connectedUser.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("teacher_id", connectedUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error("[dashboard] fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (connectedUser.id) {
      fetchDocuments();
    }
  }, [connectedUser.id]);

  return (
    <div className="container relative py-8 space-y-8 pb-16">
      <div className="pointer-events-none absolute -top-24 right-10 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-8 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-gradient-to-br from-white via-white to-accent-4/80 p-8 shadow-soft md:p-10">
        <div className="absolute right-6 top-6 hidden h-28 w-28 rounded-full border border-primary/10 bg-primary/5 md:block" />
        <div className="absolute -right-6 bottom-10 hidden h-16 w-16 rounded-xl bg-accent/10 md:block" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
              Mise à jour du 15 Fév 2026
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink md:text-5xl">
              Studio Enseignant
            </h1>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Pilotez vos séries, suivez l’impact et boostez vos revenus avec une vue claire et actionnable.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-soft">+ Créer un nouveau document</Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Nouveau document</DialogTitle>
                    <DialogDescription>
                      Créez rapidement une nouvelle série, ajoutez les détails essentiels et publiez
                      quand vous êtes prêt.
                    </DialogDescription>
                  </DialogHeader>
                  <UploadDocumentForm 
                    onSuccess={() => {
                      setIsDialogOpen(false);
                      fetchDocuments();
                    }}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="ghost" className="border border-black/5 bg-white/70">
                Statistiques détaillées
              </Button>
              <Button variant="ghost" className="border border-black/5 bg-white/70">
                Planifier une sortie
              </Button>
            </div>
          </div>
          <div className="grid w-full max-w-sm gap-4">
            <div className="rounded-2xl border border-black/5 bg-white/80 p-5 shadow-soft">
              <p className="text-xs font-semibold text-muted-foreground">Objectif mensuel</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-2xl font-bold text-ink">3 000 TND</span>
                <Badge variant="success" className="text-[10px]">
                  82% atteint
                </Badge>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-black/5">
                <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/80 p-5 shadow-soft">
              <p className="text-xs font-semibold text-muted-foreground">Nouveaux abonnés</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-2xl font-bold text-ink">+68</span>
                <span className="text-xs font-semibold text-primary">7 derniers jours</span>
              </div>
              <div className="mt-3 flex gap-2">
                {[48, 62, 52, 70, 66, 82, 72].map((h, i) => (
                  <div key={i} className="h-10 flex-1 overflow-hidden rounded-full bg-accent-4">
                    <div className="w-full rounded-full bg-primary/70" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-accent-4/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <CardContent className="relative flex h-full flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">{item.label}</p>
                </div>
                <Badge variant={item.color as any} className="text-[10px] px-2 py-0">
                  {item.trend}
                </Badge>
              </div>
              <h3 className="text-3xl font-bold">{item.value}</h3>
              <div className="h-1 w-full rounded-full bg-black/5">
                <div
                  className={cn(
                    "h-full rounded-full",
                    item.color === "primary"
                      ? "bg-gradient-to-r from-primary to-accent"
                      : item.color === "accent"
                      ? "bg-gradient-to-r from-accent to-primary"
                      : item.color === "success"
                      ? "bg-gradient-to-r from-accent-3 to-primary"
                      : "bg-gradient-to-r from-accent-2 to-accent"
                  )}
                  style={{ width: "64%" }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart (Mocked) */}
        <Card className="relative overflow-hidden lg:col-span-1">
          <div className="absolute -right-10 top-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-muted-foreground">Performance mensuelle</CardTitle>
              <p className="text-xs text-muted-foreground">Revenus sur 6 mois</p>
            </div>
            <Badge variant="success" className="text-[10px]">
              +18% MoM
            </Badge>
          </CardHeader>
          <CardContent className="flex h-52 items-end justify-between gap-2 pt-2">
            {revenueData.map((d) => (
              <div key={d.month} className="flex flex-col items-center gap-2 flex-1 group">
                <div 
                  className="w-full bg-primary/10 group-hover:bg-primary transition-all rounded-t-sm relative"
                  style={{ height: `${d.val}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-ink text-white px-1.5 py-0.5 rounded">
                    {d.val * 100} TND
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{d.month}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Documents Table Container */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-1">
              <CardTitle>Vos publications</CardTitle>
              <p className="text-xs text-muted-foreground">Dernières mises à jour de vos documents.</p>
            </div>
            <div className="flex w-full max-w-xs gap-2 md:w-auto">
              <Input placeholder="Filtrer..." className="h-9 flex-1 text-xs" />
              <Button variant="ghost" size="sm" className="h-9 border border-black/5 bg-white/70">
                Trier
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px]">Document</TableHead>
                  <TableHead>Ventes</TableHead>
                  <TableHead>Revenu</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Chargement de vos documents...
                    </TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Vous n'avez pas encore de documents. Commencez par en créer un !
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((item) => (
                    <TableRow key={item.id} className="transition-colors hover:bg-black/5">
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-bold leading-none">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.metadata?.grade || "Niveau non spécifié"} • {item.metadata?.subject || "Matière non spécifiée"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>0</TableCell>
                      <TableCell className="font-medium text-primary">
                        {item.price ? `${item.price} TND` : "Gratuit"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === "published" ? "success" : 
                            item.status === "archived" ? "muted" : "warning"
                          } 
                          className="text-[10px]"
                        >
                          {item.status === "published" ? "En ligne" : 
                           item.status === "archived" ? "Archivé" : "Brouillon"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Notifications / Recent Activity */}
      <section className="grid gap-6 md:grid-cols-2">
         <Card>
           <CardHeader>
             <CardTitle className="text-base">Derniers avis</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             {[
               { user: "Parent #942", comment: "Excellent support pédagogique !", rating: 5 },
               { user: "Élève Amine", comment: "Très clair, m'a beaucoup helpé.", rating: 5 },
             ].map((review, i) => (
               <div key={i} className="flex gap-3 text-sm border-b border-black/5 pb-3 last:border-0 last:pb-0">
                 <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent text-[10px]">
                   {review.user[0]}
                 </div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-2">
                     <span className="font-bold">{review.user}</span>
                     <span className="text-[10px] text-primary">★★★★★</span>
                   </div>
                   <p className="text-muted-foreground leading-tight italic">"{review.comment}"</p>
                 </div>
               </div>
             ))}
           </CardContent>
         </Card>
         <Card>
           <CardHeader>
             <CardTitle className="text-base">Conseils de vente</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="rounded-lg bg-accent/5 p-4 border border-accent/10">
               <p className="text-sm font-bold text-accent mb-1">Optimisez vos titres</p>
               <p className="text-xs text-muted-foreground">Les documents avec des titres clairs incluant le niveau et la matière se vendent 3x mieux.</p>
             </div>
             <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
               <p className="text-sm font-bold text-primary mb-1">Pensez aux corrigés</p>
               <p className="text-xs text-muted-foreground">L'ajout d'une version corrigée augmente le taux de conversion de vos séries de 45%.</p>
             </div>
             <div className="rounded-lg bg-white p-4 border border-black/5 shadow-soft">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-xs font-semibold text-muted-foreground">Action recommandée</p>
                   <p className="text-sm font-bold text-ink mt-1">Programmer une offre de lancement</p>
                 </div>
                 <Button size="sm" className="h-8 px-4">
                   Planifier
                 </Button>
               </div>
             </div>
           </CardContent>
         </Card>
      </section>
    </div>
  );
}
