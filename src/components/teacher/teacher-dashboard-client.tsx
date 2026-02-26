"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { UploadDocumentForm } from "./upload-document-form";
import { useRouter } from "next/navigation";

interface TeacherDashboardClientProps {
  initialDocuments: any[];
}

const stats = [
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

const revenueData = [
  { month: "Sep", val: 40 },
  { month: "Oct", val: 65 },
  { month: "Nov", val: 55 },
  { month: "Déc", val: 80 },
  { month: "Jan", val: 95 },
  { month: "Fév", val: 75 },
];

export function TeacherDashboardClient({ initialDocuments }: TeacherDashboardClientProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="container py-10 space-y-10">
      {/* Header: Simple & Focused */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">Mon Studio</h1>
          <p className="text-muted-foreground mt-1">Gérez vos séries et suivez vos performances.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full px-8 shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0">
              + Publier une série
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-[28px] overflow-hidden border-none shadow-2xl p-0">
            <div className="bg-primary/5 p-6 border-b border-primary/10">
              <DialogTitle className="text-2xl font-bold">Nouveau document</DialogTitle>
              <DialogDescription className="mt-1">
                Configurez les détails et envoyez vos fichiers.
              </DialogDescription>
            </div>
            <div className="p-6 pt-2">
              <UploadDocumentForm 
                onItemUploaded={(newDoc) => {
                  setDocuments((prev) => [newDoc, ...prev]);
                }}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  router.refresh();
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((item) => (
              <div key={item.label} className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold">{item.value}</span>
                  <span className="text-[10px] font-medium text-success-600">{item.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Documents Table */}
          <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-slate-50/50 px-6 py-4 flex flex-row items-center justify-between border-b border-black/5">
              <CardTitle className="text-base font-bold">Vos publications</CardTitle>
              <Input placeholder="Rechercher..." className="h-8 w-40 text-xs bg-white border-black/10 rounded-full" />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="px-6 h-12 text-xs font-bold text-muted-foreground uppercase">Document</TableHead>
                    <TableHead className="h-12 text-xs font-bold text-muted-foreground uppercase">Ventes</TableHead>
                    <TableHead className="h-12 text-xs font-bold text-muted-foreground uppercase">Statut</TableHead>
                    <TableHead className="px-6 h-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-24">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-accent-4/10 rounded-full flex items-center justify-center text-accent-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <p className="text-muted-foreground font-medium">Commencez par publier votre première série.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents.map((item) => (
                      <TableRow key={item.id} className="group border-b border-black/5 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-ink leading-tight">{item.title}</span>
                            <span className="text-[11px] text-muted-foreground mt-1">{item.metadata?.grade} • {item.metadata?.subject}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-bold">0</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.status === "published" ? "success" : "warning"} 
                            className="text-[10px] rounded-full px-2 py-0.5 border-none"
                          >
                            {item.status === "published" ? "En ligne" : "Brouillon"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
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

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm overflow-hidden rounded-3xl bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground flex items-center justify-between">
                Revenus
                <span className="text-[10px] text-success-600">+18% ce mois</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-end justify-between gap-1.5 pt-4">
                {revenueData.map((d) => (
                  <div key={d.month} className="flex flex-col items-center gap-2 flex-1 group">
                    <div 
                      className="w-full bg-primary/10 group-hover:bg-primary transition-all rounded-t-md"
                      style={{ height: `${d.val}%` }}
                    />
                    <span className="text-[10px] font-bold text-muted-foreground">{d.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-3xl bg-ink text-white relative overflow-hidden shadow-xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 rounded-full" />
            <div className="relative z-10 space-y-4">
              <h4 className="font-bold">Astuce Pro</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Les séries avec une description détaillée se vendent 40% mieux. Prenez le temps de décrire vos documents !
              </p>
              <Button size="sm" className="w-full bg-white text-ink hover:bg-white/90 border-none h-9 text-[11px] font-bold rounded-full">
                Voir les conseils
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
