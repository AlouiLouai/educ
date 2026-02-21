"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "../../lib/supabase/browser";
import { Profile } from "../../types";
import { buildConnectedUser, type ConnectedUser } from "../../lib/user/connected-user";

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  connectedUser: ConnectedUser;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  role: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();
          if (mounted) setProfile(data);
        }
      } catch (err) {
        console.error("[auth] initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_: any, session: any) => {
      const newUser = session?.user ?? null;
      if (!mounted) return;

      setUser(newUser);
      
      if (newUser) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", newUser.id)
          .maybeSingle();
        if (mounted) setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const connectedUser = buildConnectedUser(user, profile);

  const value = {
    user,
    profile,
    connectedUser,
    loading,
    signOut,
    isAuthenticated: !!user,
    role: connectedUser.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
