"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button, buttonVariants } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { cn } from "../components/utils";
import AuthModal from "../components/auth/auth-modal";
import { setCookie } from "../components/utils";

function SearchParamsHandler({
  onAuthParam,
}: {
  onAuthParam: (value: "student" | "teacher") => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "student" || auth === "teacher") {
      onAuthParam(auth);
    }
  }, [searchParams, onAuthParam]);

  return null;
}

export default function HomePage() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<"student" | "teacher">("student");

  const openAuthModal = (type: "student" | "teacher") => {
    setAuthRole(type);
    setAuthOpen(true);
  };

  const handleAuth = (role: "student" | "teacher", _mode: "signin" | "signup") => {
    setCookie("edudocs_auth", "1");
    setCookie("edudocs_role", role);
    setAuthOpen(false);
    router.push(role === "student" ? "/student" : "/teacher");
  };

  return (
    <div className="flex flex-col">
      <Suspense fallback={null}>
        <SearchParamsHandler
          onAuthParam={(role) => {
            setAuthRole(role);
            setAuthOpen(true);
          }}
        />
      </Suspense>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start gap-6 text-left">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary motion-safe:animate-fade-in">
              Nouveau: Marketplace 100% Tunisien 🇹🇳
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl motion-safe:animate-fade-up [animation-delay:120ms]">
              La Marketplace Éducative pour <span className="text-primary">Réussir</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground lg:text-xl motion-safe:animate-fade-up [animation-delay:200ms]">
              Accédez aux meilleures séries, cours et documents pédagogiques créés par les enseignants
              passionnés de Tunisie pour accompagner vos enfants vers l'excellence.
            </p>
            <div className="flex flex-wrap gap-4 motion-safe:animate-fade-up [animation-delay:280ms]">
              <button
                type="button"
                onClick={() => openAuthModal("student")}
                className={cn(buttonVariants({ size: "md" }), "h-12 px-8 text-lg")}
              >
                Explorer le catalogue
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("teacher")}
                className={cn(buttonVariants({ variant: "ghost", size: "md" }), "h-12 px-8 text-lg border-black/10")}
              >
                Vendre vos documents
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="motion-safe:animate-fade-in">
              <Image
                src="/illustrations/learning-hub.svg"
                alt="Learning Hub"
                width={600}
                height={500}
                className="w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>
            {/* Decorative elements removed for simpler look */}
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="border-y border-black/5 bg-white/50 py-12 backdrop-blur-sm">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Documents", value: "15k+" },
              { label: "Enseignants", value: "3,200" },
              { label: "Parents satisfaits", value: "10k+" },
              { label: "Matières", value: "24" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-ink">{stat.value}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Audience Section */}
      <section className="py-20 lg:py-32">
        <div className="container space-y-24">
          {/* For Parents */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1 relative">
              <Image
                src="/illustrations/family-learning.svg"
                alt="Family Learning"
                width={500}
                height={400}
                className="mx-auto"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Parents, offrez le meilleur à vos enfants
              </h2>
              <p className="text-lg text-muted-foreground">
                Ne perdez plus de temps à chercher des exercices de qualité. Trouvez des séries
                spécifiques au programme tunisien, du primaire au baccalauréat.
              </p>
              <ul className="space-y-4">
                {[
                  "Séries d'exercices corrigées",
                  "Cours détaillés et résumés",
                  "Préparation intensive aux examens",
                  "Accès immédiat après achat",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-medium">
                    <div className="rounded-full bg-accent/10 p-1 text-accent">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => openAuthModal("student")}
                className={cn(buttonVariants({ variant: "secondary" }), "mt-4")}
              >
                Commencer maintenant
              </button>
            </div>
          </div>

          {/* For Teachers */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Enseignants, monétisez votre expertise
              </h2>
              <p className="text-lg text-muted-foreground">
                Rejoignez la plus grande communauté d'éducateurs en Tunisie. Publiez vos documents
                et générez des revenus complémentaires tout en aidant des milliers d'élèves.
              </p>
              <ul className="space-y-4">
                {[
                  "Publication simple et rapide",
                  "Tableau de bord de ventes",
                  "Gestion de vos droits d'auteur",
                  "Paiements sécurisés",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-medium">
                    <div className="rounded-full bg-primary/10 p-1 text-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => openAuthModal("teacher")}
                className={cn(buttonVariants({ variant: "primary" }), "mt-4")}
              >
                Devenir créateur EduDocs
              </button>
            </div>
            <div className="relative">
              <Image
                src="/illustrations/teacher-creator.svg"
                alt="Teacher Creator"
                width={500}
                height={400}
                className="mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="relative overflow-hidden border border-black/10 bg-white p-8 text-center text-ink shadow-soft lg:p-16">
          
          <div className="relative z-10 mx-auto max-w-2xl space-y-6 motion-safe:animate-fade-up">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Prêt à transformer l'apprentissage ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Que vous soyez un parent soucieux de la réussite de son enfant ou un enseignant 
              souhaitant partager son savoir, EduDocs Market est fait pour vous.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => openAuthModal("student")}
                className={cn(buttonVariants({ variant: "primary", size: "md" }))}
              >
                Accès Parent / Élève
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("teacher")}
                className={cn(buttonVariants({ variant: "ghost", size: "md" }))}
              >
                Espace Enseignant
              </button>
            </div>
          </div>
        </Card>
      </section>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        role={authRole}
        onRoleChange={setAuthRole}
        onConnect={(role, mode) => handleAuth(role, mode)}
      />
    </div>
  );
}
