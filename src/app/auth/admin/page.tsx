"use client";

import { useRouter } from "next/navigation";
import AuthCard from "../../../components/auth/auth-card";
import { createClient } from "../../../lib/supabase/browser";

export default function AdminAuthPage() {
  const router = useRouter();

  const connect = async () => {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/admin")}&role=admin`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("[auth] google sign-in failed", error.message);
      return;
    }

    router.push("/");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <div className="container max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Connexion Administration</h1>
          <p className="mt-2 text-muted">
            Accédez au centre de pilotage pour modérer et superviser la marketplace.
          </p>
        </div>
        <AuthCard
          title="Accès rapide"
          description="Connectez-vous en un clic pour gérer la conformité et les opérations."
          onConnect={connect}
        />
      </div>
    </div>
  );
}
