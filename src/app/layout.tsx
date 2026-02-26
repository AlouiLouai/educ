import "./globals.css";
import { type ReactNode } from "react";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { AuthProvider } from "../components/providers/auth-provider";
import { createClient } from "../lib/supabase/server";
import { Toaster } from "sonner";

export const metadata = {
  title: "EduDocs Market — Documents enseignants pour familles",
  description:
    "Marketplace éducatif tunisien où les enseignants publient des séries, cours et documents pour le primaire et le secondaire.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    
    /**
     * EXPERT PERFORMANCE PATTERN: Parallel Auth Hydration
     * We trigger both getUser() and the profile fetch in parallel.
     * The profile fetch relies on RLS (auth.uid() = id) to automatically 
     * return the correct row based on the session cookies.
     */
    const [userRes, profileRes] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("profiles").select("*").maybeSingle()
    ]);

    user = userRes.data.user;
    profile = profileRes.data;
  } catch (error) {
    console.error("[layout] Hydration error:", error);
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased font-sans" style={{ fontFamily: 'var(--font-manrope), system-ui, sans-serif' }}>
        <AuthProvider initialSession={user ? ({ user } as any) : null} initialProfile={profile}>
          <div className="app-shell flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
