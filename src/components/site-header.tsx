"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { buttonVariants } from "./ui/button";
import { cn } from "./utils";
import { useAuth } from "../hooks/use-auth";

export default function SiteHeader() {
  const { user, profile, loading, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAuthClick = (role: "student" | "teacher" = "student") => {
    window.dispatchEvent(
      new CustomEvent("auth:open", { detail: { role } })
    );
  };

  const userInitial = profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/40">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
          <span className="text-primary">EduDocs</span>
          <span className="text-ink">Market</span>
        </Link>
        <div className="flex items-center gap-4">
          {!loading || user ? (
            user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white transition-all hover:ring-2 hover:ring-primary/20 hover:scale-[1.02] active:scale-[0.98] shadow-sm z-10"
                >
                  {profile?.avatar_url ? (
                    <Image 
                      src={profile.avatar_url} 
                      alt="User Avatar" 
                      fill
                      sizes="40px"
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 text-sm font-bold text-primary">
                      {userInitial}
                    </div>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-black/10 bg-white p-2 shadow-2xl ring-1 ring-black/5 z-50 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-top-2">
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-black/5">
                        {profile?.avatar_url ? (
                          <Image src={profile.avatar_url} alt="Avatar" fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary">
                            {userInitial}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col truncate">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {profile?.first_name || 'Utilisateur'} {profile?.last_name || ''}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="my-1 h-px bg-black/5" />
                    <div className="p-1">
                      <Link
                        href={profile?.role === "teacher" ? "/teacher" : "/student"}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-black/5"
                      >
                        <svg className="mr-2 h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                        Tableau de bord
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-black/5"
                      >
                        <svg className="mr-2 h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                        Paramètres
                      </Link>
                    </div>
                    <div className="my-1 h-px bg-black/5" />
                    <div className="p-1">
                      <form action="/auth/signout" method="POST">
                        <button
                          type="submit"
                          className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <svg className="mr-2 h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Se déconnecter
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
                onClick={() => handleAuthClick()}
              >
                Se connecter / S&apos;inscrire
              </button>
            )
          ) : (
            <div className="h-10 w-10 animate-pulse rounded-full bg-primary/5 border border-primary/10" />
          )}
        </div>
      </div>
    </header>
  );
}

