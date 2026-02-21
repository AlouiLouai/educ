import "./globals.css";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { logSupabaseConfig } from "../lib/supabase/check";
import { AuthProvider } from "../components/providers/auth-provider";

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
// ... existing metadata
  title: "EduDocs Market — Documents enseignants pour familles",
  description:
    "Marketplace éducatif tunisien où les enseignants publient des séries, cours et documents pour le primaire et le secondaire.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  logSupabaseConfig();
  return (
    <html lang="fr" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AuthProvider>
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
