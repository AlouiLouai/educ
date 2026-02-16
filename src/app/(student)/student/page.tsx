"use client";

import { useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../components/utils";

const categories = ["Tous", "Mathématiques", "Sciences", "Français", "Anglais", "Physique", "Arabe", "Informatique"];
const levels = ["Tous", "Primaire", "Secondaire"];
const gradesPrimary = ["1e année", "2e année", "3e année", "4e année", "5e année", "6e année"];
const gradesSecondary = ["7e année", "8e année", "9e année", "1re année", "2e année", "3e année"];

const documents = [
  {
    title: "Pack Mathématiques Fondamentales",
    teacher: "Mme Amina",
    grade: "3e année",
    level: "Primaire",
    price: 12,
    rating: 4.8,
    tag: "Mathématiques",
    image: "/illustrations/learning-hub.svg",
  },
  {
    title: "Sciences à la maison",
    teacher: "M. Dev",
    grade: "6e année",
    level: "Primaire",
    price: 18,
    rating: 4.9,
    tag: "Sciences",
    image: "/illustrations/market-analytics.svg",
  },
  {
    title: "Sprint écriture créative",
    teacher: "Mme Leila",
    grade: "5e année",
    level: "Primaire",
    price: 10,
    rating: 4.7,
    tag: "Français",
    image: "/illustrations/teacher-creator.svg",
  },
  {
    title: "Anglais pour débutants",
    teacher: "M. Ahmed",
    grade: "4e année",
    level: "Primaire",
    price: 15,
    rating: 4.6,
    tag: "Anglais",
    image: "/illustrations/family-learning.svg",
  },
  {
    title: "Physique - Révision rapide",
    teacher: "Mme Sana",
    grade: "2e année",
    level: "Secondaire",
    price: 22,
    rating: 4.5,
    tag: "Physique",
    image: "/illustrations/teacher-creator.svg",
  },
  {
    title: "Maths Collège - Bases solides",
    teacher: "M. Hamdi",
    grade: "7e année",
    level: "Secondaire",
    price: 14,
    rating: 4.4,
    tag: "Mathématiques",
    image: "/illustrations/family-learning.svg",
  },
  {
    title: "Français - Lecture & Résumés",
    teacher: "Mme Rania",
    grade: "8e année",
    level: "Secondaire",
    price: 16,
    rating: 4.6,
    tag: "Français",
    image: "/illustrations/learning-hub.svg",
  },
  {
    title: "Arabe - Grammaire facile",
    teacher: "M. Karim",
    grade: "6e année",
    level: "Primaire",
    price: 9,
    rating: 4.3,
    tag: "Arabe",
    image: "/illustrations/market-analytics.svg",
  },
  {
    title: "Informatique - Initiation",
    teacher: "Mme Ines",
    grade: "9e année",
    level: "Secondaire",
    price: 19,
    rating: 4.7,
    tag: "Informatique",
    image: "/illustrations/teacher-creator.svg",
  },
  {
    title: "Anglais - Speaking drills",
    teacher: "M. Youssef",
    grade: "1re année",
    level: "Secondaire",
    price: 17,
    rating: 4.5,
    tag: "Anglais",
    image: "/illustrations/family-learning.svg",
  },
  {
    title: "Maths - Bac Math",
    teacher: "Mme Salma",
    grade: "3e année",
    level: "Secondaire",
    price: 28,
    rating: 4.9,
    tag: "Mathématiques",
    image: "/illustrations/learning-hub.svg",
  },
  {
    title: "Sciences - Système vivant",
    teacher: "M. Adel",
    grade: "2e année",
    level: "Secondaire",
    price: 21,
    rating: 4.6,
    tag: "Sciences",
    image: "/illustrations/market-analytics.svg",
  },
  {
    title: "Français - Expression écrite",
    teacher: "Mme Emna",
    grade: "1re année",
    level: "Secondaire",
    price: 15,
    rating: 4.4,
    tag: "Français",
    image: "/illustrations/teacher-creator.svg",
  },
  {
    title: "Physique - Mécanique",
    teacher: "M. Aziz",
    grade: "3e année",
    level: "Secondaire",
    price: 24,
    rating: 4.8,
    tag: "Physique",
    image: "/illustrations/market-analytics.svg",
  },
  {
    title: "Maths - Problèmes guidés",
    teacher: "Mme Nadia",
    grade: "5e année",
    level: "Primaire",
    price: 13,
    rating: 4.5,
    tag: "Mathématiques",
    image: "/illustrations/family-learning.svg",
  },
  {
    title: "Sciences - Expériences simples",
    teacher: "M. Sofien",
    grade: "4e année",
    level: "Primaire",
    price: 11,
    rating: 4.4,
    tag: "Sciences",
    image: "/illustrations/learning-hub.svg",
  },
  {
    title: "Arabe - Orthographe",
    teacher: "Mme Hela",
    grade: "3e année",
    level: "Primaire",
    price: 10,
    rating: 4.2,
    tag: "Arabe",
    image: "/illustrations/teacher-creator.svg",
  },
  {
    title: "Informatique - Algorithmique",
    teacher: "M. Sami",
    grade: "2e année",
    level: "Secondaire",
    price: 20,
    rating: 4.6,
    tag: "Informatique",
    image: "/illustrations/market-analytics.svg",
  },
  {
    title: "Anglais - Grammar Master",
    teacher: "Mme Mariem",
    grade: "6e année",
    level: "Primaire",
    price: 14,
    rating: 4.5,
    tag: "Anglais",
    image: "/illustrations/learning-hub.svg",
  },
  {
    title: "Français - Lecture intensive",
    teacher: "M. Hichem",
    grade: "7e année",
    level: "Secondaire",
    price: 18,
    rating: 4.3,
    tag: "Français",
    image: "/illustrations/family-learning.svg",
  },
];

const purchasedDocs = [
  { title: "Révision Trimestre 1", progress: 85, subject: "Maths" },
  { title: "Vocabulaire Essentiel", progress: 40, subject: "Français" },
];

export default function StudentDashboard() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [level, setLevel] = useState("Tous");
  const [grade, setGrade] = useState("Tous");
  const [priceMax, setPriceMax] = useState("Tous");
  const [ratingMin, setRatingMin] = useState("Tous");
  const [sort, setSort] = useState("popular");
  const [visibleCount, setVisibleCount] = useState(8);

  const gradeOptions = useMemo(() => {
    if (level === "Primaire") return gradesPrimary;
    if (level === "Secondaire") return gradesSecondary;
    return [...gradesPrimary, ...gradesSecondary];
  }, [level]);

  const filteredDocs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return documents
      .filter((doc) => (category === "Tous" ? true : doc.tag === category))
      .filter((doc) => (level === "Tous" ? true : doc.level === level))
      .filter((doc) => (grade === "Tous" ? true : doc.grade === grade))
      .filter((doc) => {
        if (priceMax === "Tous") return true;
        const max = Number(priceMax);
        return doc.price <= max;
      })
      .filter((doc) => {
        if (ratingMin === "Tous") return true;
        const min = Number(ratingMin);
        return doc.rating >= min;
      })
      .filter((doc) => {
        if (!normalizedSearch) return true;
        return (
          doc.title.toLowerCase().includes(normalizedSearch) ||
          doc.teacher.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((a, b) => {
        if (sort === "price_low") return a.price - b.price;
        if (sort === "price_high") return b.price - a.price;
        if (sort === "rating") return b.rating - a.rating;
        return b.rating - a.rating;
      });
  }, [category, grade, level, priceMax, ratingMin, search, sort]);

  const visibleDocs = filteredDocs.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredDocs.length;

  const clearFilters = () => {
    setSearch("");
    setCategory("Tous");
    setLevel("Tous");
    setGrade("Tous");
    setPriceMax("Tous");
    setRatingMin("Tous");
    setSort("popular");
    setVisibleCount(8);
  };

  const handleCategory = (value: string) => {
    setCategory(value);
    setVisibleCount(8);
  };

  return (
    <div className="container py-8 space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bonjour, Louai 👋</h1>
          <p className="text-muted-foreground text-lg">Prêt pour une nouvelle séance d'apprentissage ?</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">Crédits: 45 TND</p>
            <p className="text-xs text-muted-foreground">Compte Premium</p>
          </div>
          <Button>Recharger</Button>
        </div>
      </div>

      {/* Continue Learning Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Continuer l'apprentissage</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {purchasedDocs.map((doc) => (
            <Card key={doc.title} className="relative overflow-hidden border-none bg-ink text-white">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
              <CardContent className="p-6 relative z-10 flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div>
                    <Badge variant="success" className="bg-white/10 text-white border-none mb-2">{doc.subject}</Badge>
                    <h3 className="font-bold text-lg">{doc.title}</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progression</span>
                      <span>{doc.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${doc.progress}%` }} />
                    </div>
                  </div>
                </div>
                <Button variant="primary" className="ml-6 bg-white text-ink hover:bg-white/90">Reprendre</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Explorer Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">Explorer le catalogue</h2>
            <p className="text-sm text-muted-foreground">
              Trouvez rapidement des documents adaptés au programme tunisien.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-5 rounded-2xl border border-black/5 bg-white p-5 shadow-soft lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Filtres</p>
                <p className="text-xs text-muted-foreground">{filteredDocs.length} documents</p>
              </div>
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
                    variant={level === item ? "primary" : "ghost"}
                    onClick={() => {
                      setLevel(item);
                      setGrade("Tous");
                      setVisibleCount(8);
                    }}
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
                value={grade}
                onChange={(event) => {
                  setGrade(event.target.value);
                  setVisibleCount(8);
                }}
              >
                <option value="Tous">Toutes</option>
                {gradeOptions.map((item, index) => (
                  <option key={`${item}-${index}`} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Matière</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={cat === category ? "primary" : "ghost"}
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => handleCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Prix</p>
              <select
                className="w-full rounded-full border border-black/10 bg-white px-3 py-2 text-sm"
                value={priceMax}
                onChange={(event) => {
                  setPriceMax(event.target.value);
                  setVisibleCount(8);
                }}
              >
                <option value="Tous">Tous</option>
                <option value="10">≤ 10 TND</option>
                <option value="15">≤ 15 TND</option>
                <option value="20">≤ 20 TND</option>
                <option value="25">≤ 25 TND</option>
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Note</p>
              <select
                className="w-full rounded-full border border-black/10 bg-white px-3 py-2 text-sm"
                value={ratingMin}
                onChange={(event) => {
                  setRatingMin(event.target.value);
                  setVisibleCount(8);
                }}
              >
                <option value="Tous">Toutes</option>
                <option value="4.2">4.2+</option>
                <option value="4.5">4.5+</option>
                <option value="4.8">4.8+</option>
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Trier par</p>
              <select
                className="w-full rounded-full border border-black/10 bg-white px-3 py-2 text-sm"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="popular">Populaire</option>
                <option value="rating">Meilleure note</option>
                <option value="price_low">Prix croissant</option>
                <option value="price_high">Prix décroissant</option>
              </select>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-soft md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                <span>Catalogue intelligent</span>
              </div>
              <div className="flex w-full flex-1 items-center gap-2 md:max-w-lg">
                <Input
                  placeholder="Rechercher un document, un prof..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Button size="sm" variant="primary">
                  Rechercher
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleDocs.map((doc) => (
                <Card key={`${doc.title}-${doc.teacher}`} className="group overflow-hidden border-black/5 transition-all hover:shadow-xl">
                  <div className="aspect-[5/3] bg-muted relative overflow-hidden">
                     <img 
                      src={doc.image} 
                      alt={doc.title} 
                      className="object-cover w-full h-full transition-transform group-hover:scale-105 opacity-80"
                     />
                     <div className="absolute top-3 right-3">
                       <Badge className="bg-white/90 backdrop-blur shadow-sm text-ink">{doc.tag}</Badge>
                     </div>
                  </div>
                  <CardContent className="p-3 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-primary">★ {doc.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">{doc.grade}</span>
                      </div>
                      <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{doc.teacher}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-black/5">
                      <span className="font-bold text-base">{doc.price} TND</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        </Button>
                        <Button size="sm" className="h-8">Acheter</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                disabled={!canLoadMore}
                onClick={() => setVisibleCount((prev) => Math.min(prev + 8, filteredDocs.length))}
              >
                {canLoadMore ? "Charger plus" : "Tout affiché"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
