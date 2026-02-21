"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/use-auth";
import { Trash2, User, Mail, ShieldCheck, Calendar } from "lucide-react";
import Image from "next/image";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user, profile, connectedUser } = useAuth();

  const registrationDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Inconnue';

  const displayName = connectedUser.displayName;
  const userInitial = connectedUser.initial;
  const fullName = connectedUser.fullName || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] overflow-hidden rounded-[24px]">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-white shadow-sm">
              {connectedUser.avatarUrl ? (
                // Use native img to avoid Next/Image remote host constraints for Supabase storage.
                <img
                  src={connectedUser.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 text-xl font-bold text-primary">
                  {userInitial}
                </div>
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">Mon Compte</DialogTitle>
              <DialogDescription>
                Gérez vos informations EduDocs.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid gap-6 py-2">
          {/* User Profile Section */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <User className="h-3 w-3" />
              Informations Personnelles
            </h4>
            <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Nom complet</span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <User className="h-3 w-3 opacity-50" />
                  {fullName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Email</span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Mail className="h-3 w-3 opacity-50" />
                  {user?.email}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Rôle</span>
                <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                  {profile?.role === 'teacher' ? 'Enseignant' : 'Parent / Élève'}
                </div>
              </div>
            </div>
          </div>

          {/* Account Status Section */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              Sécurité & Historique
            </h4>
            <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Membre depuis</span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 opacity-50" />
                  {registrationDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Statut du compte</span>
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                  Actif
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-black/5" />

          {/* Danger Zone */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600/70">
              Zone de danger
            </h4>
            <div className="rounded-2xl border border-red-100 bg-red-50/30 p-4">
              <p className="text-xs text-red-600/80 mb-3 leading-relaxed">
                La suppression de votre compte est définitive. Toutes vos données, y compris vos achats et documents, seront supprimées de nos serveurs.
              </p>
              <form action="/auth/delete-account" method="POST" onSubmit={(e) => {
                if (!confirm("ATTENTION : Cette action est irréversible. Toutes vos données seront supprimées. Confirmer la suppression ?")) {
                  e.preventDefault();
                }
              }}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center gap-2 text-red-600 font-bold hover:bg-red-50 hover:text-red-700 border border-red-100 bg-white"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer définitivement mon compte
                </Button>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
