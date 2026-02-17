"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
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

function GoogleButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <Button
      type="button"
      className="w-full gap-3 rounded-full bg-white text-foreground shadow-[0_10px_30px_-20px_rgba(15,23,42,0.5)] ring-1 ring-black/10 hover:bg-white active:scale-[0.98]"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M24 9.5c3.1 0 5.9 1.1 8 3l5.9-5.9C34.3 3 29.5 1 24 1 14.6 1 6.6 6.2 2.7 13.7l6.9 5.4C11.4 13.1 17.2 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.1 24.6c0-1.5-.1-2.6-.4-3.8H24v7.2h12.6c-.3 2-1.9 5-5.1 7l7.8 6c4.6-4.2 6.8-10.3 6.8-16.4z"
          />
          <path
            fill="#34A853"
            d="M9.6 28.7c-1-2-1.6-4.3-1.6-6.7s.6-4.7 1.6-6.7l-6.9-5.4C1 12.6 0 17.2 0 22s1 9.4 2.7 12.1l6.9-5.4z"
          />
          <path
            fill="#FBBC05"
            d="M24 46c5.5 0 10.2-1.8 13.6-4.9l-7.8-6c-2.2 1.5-5.1 2.5-5.8 2.5-6.8 0-12.6-3.6-15.4-8.6l-6.9 5.4C6.6 41.8 14.6 46 24 46z"
          />
        </svg>
      </span>
      {label}
    </Button>
  );
}

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
  const [mode, setMode] = useState<AuthMode>("signin");
  const [roleTouched, setRoleTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      setMode("signin");
      setRoleTouched(false);
    }
  }, [open]);

  const isSignup = mode === "signup";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl border-0 bg-transparent p-0 shadow-none">
        <DialogTitle className="sr-only">Authentification</DialogTitle>
        <DialogDescription className="sr-only">
          Connexion ou création de compte avec Google.
        </DialogDescription>
        <div className="mt-2">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/95">
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

              <div className="relative flex min-h-[460px] items-center p-6 sm:p-10">
                <AnimatePresence mode="wait">
                  {isSignup ? (
                    <motion.div
                      key="signup-left"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="mx-auto w-full max-w-sm text-center">
                        <h3 className="text-2xl font-semibold">Créer un compte</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Rejoignez EduDocs en moins d&apos;une minute.
                        </p>
                      <div className="mt-6 rounded-2xl border border-black/10 bg-white/80 p-4 text-left shadow-[0_12px_30px_-24px_rgba(15,23,42,0.6)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Choisissez votre profil
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Cela personnalise votre accès aux contenus et aux outils.
                        </p>
                        <div
                          className={cn(
                            "mt-3 grid gap-2 sm:grid-cols-2",
                            !roleTouched && "ring-1 ring-amber-400/60 ring-offset-2 ring-offset-white"
                          )}
                        >
                          {(["student", "teacher"] as const).map((value) => {
                            const selected = role === value;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => {
                                  onRoleChange(value);
                                  setRoleTouched(true);
                                }}
                                className={cn(
                                  "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                                  selected
                                    ? "border-[#2f55ff]/60 bg-[#2f55ff]/10 text-[#2f55ff]"
                                    : "border-black/10 text-foreground hover:border-black/20"
                                )}
                              >
                                <span>{authCopy[value].title}</span>
                                <span
                                  className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold",
                                    selected
                                      ? "border-[#2f55ff]/60 bg-[#2f55ff]/10 text-[#2f55ff]"
                                      : "border-black/10 text-muted-foreground"
                                  )}
                                >
                                  {selected ? "✓" : "•"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {!roleTouched && (
                          <p className="mt-3 text-xs text-amber-600">
                            Sélectionnez votre profil (obligatoire) pour continuer.
                          </p>
                        )}
                      </div>
                      <div className="mt-6">
                        <GoogleButton
                          onClick={() => onConnect(role, "signup")}
                          disabled={!roleTouched}
                          label="Continuer avec Google"
                        />
                      </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="relative flex min-h-[460px] items-center p-6 sm:p-10">
                <AnimatePresence mode="wait">
                  {!isSignup ? (
                    <motion.div
                      key="signin-right"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="w-full">
                        <h3 className="text-2xl font-semibold">Se connecter</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Utilisez vos identifiants pour accéder à votre espace.
                      </p>
                      <div className="mt-6">
                        <GoogleButton onClick={() => onConnect(role, "signin")} label="Continuer avec Google" />
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Le profil est requis uniquement à l&apos;inscription pour personnaliser votre espace.
                      </p>
                      </div>
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
