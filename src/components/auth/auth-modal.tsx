"use client";

import AuthCard from "./auth-card";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type AuthRole = "student" | "teacher";

const authCopy: Record<AuthRole, { title: string; description: string; cardDescription: string }> = {
  student: {
    title: "Connexion Parent / Élève",
    description: "Accédez à votre panier, achetez des documents et suivez la progression.",
    cardDescription: "Connectez-vous en un clic pour explorer et acheter les packs disponibles.",
  },
  teacher: {
    title: "Connexion Enseignant",
    description: "Accédez à votre studio, publiez des documents et suivez vos ventes.",
    cardDescription: "Connectez-vous en un clic pour publier vos séries et consulter les performances.",
  },
};

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: AuthRole;
  onConnect: () => void;
}

export default function AuthModal({ open, onOpenChange, role, onConnect }: AuthModalProps) {
  const copy = authCopy[role];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <AuthCard
            title="Accès rapide"
            description={copy.cardDescription}
            onConnect={onConnect}
            variant="plain"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
