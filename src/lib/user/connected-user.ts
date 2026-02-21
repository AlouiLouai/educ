import type { User } from "@supabase/supabase-js";
import type { Profile } from "../../types";

export type ConnectedUser = {
  id: string | null;
  email: string | null;
  fullName: string;
  displayName: string;
  avatarUrl: string | null;
  initial: string;
  role: string | null;
};

export function buildConnectedUser(user: User | null, profile: Partial<Profile> | null): ConnectedUser {
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
  const email = user?.email ?? profile?.email ?? null;
  const displayName = fullName || email || "Utilisateur";
  const initialSeed = profile?.first_name?.[0] || profile?.last_name?.[0] || email?.[0] || "U";

  return {
    id: user?.id ?? profile?.id ?? null,
    email,
    fullName,
    displayName,
    avatarUrl: profile?.avatar_url ?? null,
    initial: initialSeed.toUpperCase(),
    role: profile?.role || (user?.user_metadata?.role as string) || null,
  };
}
