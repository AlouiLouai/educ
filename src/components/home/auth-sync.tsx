"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "../auth/auth-modal";
import { createClient } from "../../lib/supabase/browser";

function AuthSyncLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<"student" | "teacher">("student");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    // EXPERT PATTERN: Intelligent Role & Destination Detection
    const getRoleHint = () => {
      // 1. Check current URL (Highest priority for context)
      if (window.location.pathname.startsWith("/teacher")) return "teacher";
      if (window.location.pathname.startsWith("/student")) return "student";
      
      // 2. Check cookie (Historical preference)
      const match = document.cookie.match(/edudocs_role=([^;]+)/);
      if (match && (match[1] === "teacher" || match[1] === "student")) {
        return match[1] as "student" | "teacher";
      }
      
      return "student"; // Default
    };

    const info = searchParams.get("info");
    if (info === "account_exists") {
      alert("Vous avez déjà un compte. Veuillez vous connecter au lieu de vous inscrire.");
      setAuthMode("signin");
      setAuthRole(getRoleHint());
      setAuthOpen(true);
      router.replace("/");
    }

    const error = searchParams.get("error");
    if (error === "account_not_found") {
      alert("Aucun compte trouvé avec cet e-mail. Veuillez d'abord vous inscrire.");
      setAuthMode("signup");
      setAuthOpen(true);
      router.replace("/");
    }

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ role?: "student" | "teacher" }>).detail;
      
      // Use role from event if specified, otherwise detect from context
      const role = detail?.role ? detail.role : getRoleHint();
        
      setAuthRole(role);
      setAuthMode("signin");
      setAuthOpen(true);
    };
    window.addEventListener("auth:open", handler);

    const auth = searchParams.get("auth");
    if (auth === "student" || auth === "teacher") {
      setAuthRole(auth as "student" | "teacher");
      const modeParam = searchParams.get("mode");
      if (modeParam === "signin" || modeParam === "signup") {
        setAuthMode(modeParam);
      }
      setAuthOpen(true);
    }

    return () => window.removeEventListener("auth:open", handler);
  }, [searchParams, router]);

  const handleAuth = async (role: "student" | "teacher", mode: "signin" | "signup") => {
    const supabase = createClient();
    const next = role === "student" ? "/student" : "/teacher";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}&role=${role}&mode=${mode}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: mode === "signup" ? { role, signup: "true" } : { signup: "false" },
      },
    });

    if (error) {
      console.error("[auth] google sign-in failed", error.message);
      return;
    }

    setAuthOpen(false);
  };

  return (
    <AuthModal
      open={authOpen}
      onOpenChange={setAuthOpen}
      role={authRole}
      onRoleChange={setAuthRole}
      onConnect={handleAuth}
      mode={authMode}
      onModeChange={setAuthMode}
    />
  );
}

export default function AuthSync() {
  return (
    <Suspense fallback={null}>
      <AuthSyncLogic />
    </Suspense>
  );
}
