import { createClient } from "../../../lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ALLOWED_ROLES = ["student", "teacher"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const requestedRole = url.searchParams.get("role");

  // Fallback to home if no code is present
  if (!code) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const cookieStore = await cookies();
  const supabase = await createClient();

  // Exchange the code for a session
  const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("[auth] exchangeCodeForSession failed:", exchangeError.message);
    return NextResponse.redirect(new URL("/?error=auth_failed", url.origin));
  }

  const user = exchangeData.user;
  if (!user) {
    console.error("[auth] no user after exchange");
    return NextResponse.redirect(new URL("/?error=user_not_found", url.origin));
  }

  // 2. Determine and sync the final role
  let finalRole = user.user_metadata?.role;

  // If a role was requested, we use it to ensure the user gets where they wanted.
  if (requestedRole && ALLOWED_ROLES.includes(requestedRole)) {
    // Update metadata if it's different or missing
    if (finalRole !== requestedRole) {
      await supabase.auth.updateUser({
        data: { role: requestedRole },
      });
      finalRole = requestedRole;
    }
  } 
  
  if (!finalRole) {
    finalRole = "student";
  }

  // Double check the profile exists and has the correct role
  // Since the SQL trigger only updates on INSERT for role, we might need a manual sync if the profile already existed
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile && profile.role !== finalRole) {
    await supabase.from("profiles").update({ role: finalRole }).eq("id", user.id);
  }

  // 3. Determine redirect path
  // We prioritize the path corresponding to the FINAL role to avoid middleware conflicts
  let redirectPath = "/";
  if (finalRole === "student") redirectPath = "/student";
  else if (finalRole === "teacher") redirectPath = "/teacher";
  else if (finalRole === "admin") redirectPath = "/admin";
  
  // If nextParam was provided and matches the role, use it (handles sub-paths)
  if (nextParam && nextParam.startsWith(redirectPath)) {
    redirectPath = nextParam;
  }

  const response = NextResponse.redirect(new URL(redirectPath, url.origin));

  // 4. Set helper cookies for client-side UX (not for security)
  if (finalRole) {
    response.cookies.set("edudocs_role", finalRole, { 
      path: "/", 
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax"
    });
  }
  response.cookies.set("edudocs_auth", "1", { 
    path: "/", 
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax"
  });

  return response;
}
