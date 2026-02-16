import "./globals.css";
import type { ReactNode } from "react";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";

export const metadata = {
  title: "EduDocs Market — Documents enseignants pour familles",
  description:
    "Marketplace éducatif tunisien où les enseignants publient des séries, cours et documents pour le primaire et le secondaire.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="app-shell">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
