import "./globals.css";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { logSupabaseConfig } from "../lib/supabase/check";
import { AuthProvider } from "../components/providers/auth-provider";
import { createClient } from "../lib/supabase/server";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = {
  title: "EduDocs Market — Documents enseignants pour familles",
  description:
    "Marketplace éducatif tunisien où les enseignants publient des séries, cours et documents pour le primaire et le secondaire.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  logSupabaseConfig();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <html lang="fr" className={`${manrope.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body>
        <AuthProvider initialSession={user ? ({ user } as any) : null} initialProfile={profile}>
          <div className="app-shell flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
