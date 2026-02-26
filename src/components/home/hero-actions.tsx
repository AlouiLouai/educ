"use client";

import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { cn } from "../utils";
import { useAuth } from "../../hooks/use-auth";

export default function HeroActions() {
  const { user, profile } = useAuth();

  const openAuthModal = (role: "student" | "teacher") => {
    window.dispatchEvent(new CustomEvent("auth:open", { detail: { role } }));
  };

  if (user) {
    return (
      <Link
        href={profile?.role === "teacher" ? "/teacher" : "/student"}
        className={cn(buttonVariants({ size: "md" }), "h-12 px-8 text-lg shadow-xl shadow-primary/20")}
      >
        Accéder à mon espace {profile?.role === "teacher" ? "Enseignant" : "Élève"}
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
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
  );
}
