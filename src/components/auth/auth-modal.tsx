"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { cn } from "../utils";

type AuthRole = "student" | "teacher";
type AuthMode = "signin" | "signup";

const authCopy: Record<AuthRole, { title: string; description: string }> = {
  student: {
    title: "Parent / Élève",
    description: "Accédez aux documents, achetez les packs et suivez la progression.",
  },
  teacher: {
    title: "Enseignant",
    description: "Gérez votre studio, publiez des documents et suivez vos ventes.",
  },
};

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: AuthRole;
  onRoleChange: (role: AuthRole) => void;
  onConnect: (role: AuthRole, mode: AuthMode) => void;
}

export default function AuthModal({
  open,
  onOpenChange,
  role,
  onRoleChange,
  onConnect,
}: AuthModalProps) {
  const copy = authCopy[role];
  const [mode, setMode] = useState<AuthMode>("signin");

  useEffect(() => {
    if (!open) {
      setMode("signin");
    }
  }, [open]);

  const isSignup = mode === "signup";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{mode === "signin" ? "Se connecter" : "Créer un compte"}</DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? "Accédez à votre espace en quelques secondes."
              : "Créez votre compte et commencez tout de suite."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/90 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="grid gap-0 sm:grid-cols-2">
              <div className="block sm:hidden">
                <div className="rounded-b-3xl bg-gradient-to-br from-[#1c2fb8] via-[#2f55ff] to-[#2bb4f5] px-6 py-8 text-center text-white">
                  <h4 className="text-2xl font-semibold">
                    {isSignup ? "Bon retour !" : "Hey, bienvenue !"}
                  </h4>
                  <p className="mt-3 text-sm text-white/85">
                    {isSignup
                      ? "Reconnectez-vous pour continuer votre expérience."
                      : "Créez un compte et commencez en quelques clics."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode(isSignup ? "signin" : "signup")}
                    className="mt-5 rounded-full border border-white/40 px-5 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-white/10 active:scale-[0.98]"
                  >
                    {isSignup ? "Se connecter" : "S'inscrire"}
                  </button>
                </div>
              </div>

              <div className="relative min-h-[460px] p-6 sm:p-10">
                <AnimatePresence mode="wait">
                  {isSignup ? (
                    <motion.div
                      key="signup-left"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3 className="text-2xl font-semibold">Créer un compte</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Rejoignez EduDocs en moins d&apos;une minute.
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        {["G", "f", "in"].map((label) => (
                          <button
                            key={label}
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-xs font-semibold text-foreground hover:border-black/20"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-6 space-y-3">
                        <input
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2f55ff]"
                          placeholder="Nom complet"
                        />
                        <input
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2f55ff]"
                          placeholder="Email"
                          type="email"
                        />
                        <input
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2f55ff]"
                          placeholder="Mot de passe"
                          type="password"
                        />
                      </div>
                      <div className="mt-5 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Choisissez votre profil</p>
                        <div className="inline-flex flex-wrap gap-2">
                          {(["student", "teacher"] as const).map((value) => {
                            const selected = role === value;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => onRoleChange(value)}
                                className={cn(
                                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                                  selected
                                    ? "border-[#2f55ff]/60 bg-[#2f55ff]/10 text-[#2f55ff]"
                                    : "border-black/10 text-foreground hover:border-black/20"
                                )}
                              >
                                {authCopy[value].title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <Button
                        type="button"
                        className="mt-6 w-full active:scale-[0.98]"
                        onClick={() => onConnect(role, "signup")}
                      >
                        Créer mon compte
                      </Button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="relative min-h-[460px] p-6 sm:p-10">
                <AnimatePresence mode="wait">
                  {!isSignup ? (
                    <motion.div
                      key="signin-right"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3 className="text-2xl font-semibold">Se connecter</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Utilisez vos identifiants pour accéder à votre espace.
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        {["G", "f", "in"].map((label) => (
                          <button
                            key={label}
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-xs font-semibold text-foreground hover:border-black/20"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-6 space-y-3">
                        <input
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2f55ff]"
                          placeholder="Email"
                          type="email"
                        />
                        <input
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2f55ff]"
                          placeholder="Mot de passe"
                          type="password"
                        />
                      </div>
                      <div className="mt-4 text-xs text-right text-muted-foreground">
                        <button type="button" className="font-semibold text-[#2f55ff]">
                          Mot de passe oublié ?
                        </button>
                      </div>
                      <div className="mt-5 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Choisissez votre profil</p>
                        <div className="inline-flex flex-wrap gap-2">
                          {(["student", "teacher"] as const).map((value) => {
                            const selected = role === value;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => onRoleChange(value)}
                                className={cn(
                                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                                  selected
                                    ? "border-[#2f55ff]/60 bg-[#2f55ff]/10 text-[#2f55ff]"
                                    : "border-black/10 text-foreground hover:border-black/20"
                                )}
                              >
                                {authCopy[value].title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <Button
                        type="button"
                        className="mt-6 w-full active:scale-[0.98]"
                        onClick={() => onConnect(role, "signin")}
                      >
                        Se connecter
                      </Button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            <motion.div
              layout
              className="absolute top-0 hidden h-full w-1/2 items-center justify-center text-center text-white sm:flex"
              style={{
                background:
                  "linear-gradient(135deg, #1c2fb8 0%, #2f55ff 55%, #2bb4f5 100%)",
                zIndex: 20,
              }}
              animate={{ left: isSignup ? "50%" : "0%" }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
            >
              <div className="px-8">
                <h4 className="text-2xl font-semibold">
                  {isSignup ? "Bon retour !" : "Hey, bienvenue !"}
                </h4>
                <p className="mt-3 text-sm text-white/85">
                  {isSignup
                    ? "Reconnectez-vous pour continuer votre expérience."
                    : "Créez un compte pour accéder aux contenus en quelques clics."}
                </p>
                <button
                  type="button"
                  onClick={() => setMode(isSignup ? "signin" : "signup")}
                  className="mt-6 rounded-full border border-white/40 px-5 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-white/10 active:scale-[0.98]"
                >
                  {isSignup ? "Se connecter" : "S'inscrire"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
