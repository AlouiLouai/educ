import { createClient } from "../../lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const appMeta = (user?.app_metadata as { role?: string; profile?: boolean } | undefined) ?? {};
  const role = appMeta.role ?? (user?.user_metadata as { role?: string } | undefined)?.role;
  const cookieStore = await cookies();
  const hasProfile = appMeta.profile === true || cookieStore.get("edudocs_profile")?.value === "1";

  if (!user || !hasProfile || role !== "teacher") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-bg">
      {children}
    </main>
  );
}
