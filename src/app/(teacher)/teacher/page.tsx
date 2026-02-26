import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { TeacherDashboardClient } from "../../../components/teacher/teacher-dashboard-client";

/**
 * EXPERT PERFORMANCE: Server Component Teacher Dashboard
 * Fetches user and documents in parallel on the server to eliminate
 * client-side loading states and Waterfall requests.
 */
export default async function TeacherDashboard() {
  const supabase = await createClient();

  // 1. Get user first to ensure authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/");
  }

  // 2. Fetch documents for this teacher
  // In a real production app with RLS, the filter is redundant but safe.
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <TeacherDashboardClient 
      initialDocuments={documents || []} 
    />
  );
}
