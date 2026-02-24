"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
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
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialSession?: Session | null;
  initialProfile?: Profile | null;
}

export function AuthProvider({ children, initialSession, initialProfile }: AuthProviderProps) {
  // Use server-provided data for initial state to prevent hydration mismatch and flickering
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [profile, setProfile] = useState<Profile | null>(initialProfile ?? null);
  const [loading, setLoading] = useState(!initialSession);
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string, retries = 0) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (error) {
      console.error("[auth] profile fetch error:", error);
    }

    if (data) {
      setProfile(data);
    } else if (retries < 2) {
      // Retry for eventual consistency during initial signup redirect
      setTimeout(() => fetchProfile(userId, retries + 1), 1000);
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // If we didn't have an initial session from the server, fetch it now
    if (!initialSession) {
      async function initAuth() {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (!mounted) return;

          setUser(currentUser);
          
          if (currentUser) {
            await fetchProfile(currentUser.id);
          }
        } catch (err) {
          console.error("[auth] initialization error:", err);
        } finally {
          if (mounted) setLoading(false);
        }
      }
      initAuth();
    } else {
      // If we have initial data, ensure loading is false immediately
      setLoading(false);
    }

    let profileSubscription: any = null;

    const setupProfileSubscription = (userId: string) => {
      if (profileSubscription) profileSubscription.unsubscribe();
      
      profileSubscription = supabase
        .channel(`profile-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`,
          },
          (payload: any) => {
            if (mounted) setProfile(payload.new as Profile);
          }
        )
        .subscribe();
    };

    // Initialize subscription if user exists
    if (user) setupProfileSubscription(user.id);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      
      const newUser = session?.user ?? null;
      
      // Handle session changes (login, logout, token refresh)
      if (newUser) {
        if (newUser.id !== user?.id) {
          setUser(newUser);
          setupProfileSubscription(newUser.id);
          await fetchProfile(newUser.id);
        }
      } else if (event === 'SIGNED_OUT') {
        if (profileSubscription) profileSubscription.unsubscribe();
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (profileSubscription) profileSubscription.unsubscribe();
    };
  }, [supabase, initialSession, user?.id, fetchProfile]);

  const signOut = async () => {
    // We use scope: 'local' to only sign out from this app, 
    // keeping the Google session active in the browser for faster re-entry.
    await supabase.auth.signOut({ scope: 'local' });
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
    refreshProfile,
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
