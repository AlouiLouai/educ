"use client";

import { useRouter } from "next/navigation";
import AuthCard from "../../../components/auth/auth-card";
import { setCookie } from "../../../components/utils";

export default function AdminAuthPage() {
  const router = useRouter();

  const connect = () => {
    setCookie("edudocs_auth", "1");
    setCookie("edudocs_role", "admin");
    router.push("/admin");
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
