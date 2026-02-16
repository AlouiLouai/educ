import type { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-bg">
      {children}
    </main>
  );
}
