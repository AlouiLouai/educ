import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata.role !== "teacher") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-bg">
      {children}
    </main>
  );
}
