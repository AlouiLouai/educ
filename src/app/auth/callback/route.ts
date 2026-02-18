import { createClient } from "../../../lib/supabase/server";
import { NextResponse } from "next/server";

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

  const supabase = await createClient();

  // Exchange the code for a session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("[auth] exchangeCodeForSession failed:", exchangeError.message);
    return NextResponse.redirect(new URL("/?error=auth_failed", url.origin));
  }

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("[auth] getUser failed:", userError?.message);
    return NextResponse.redirect(new URL("/?error=user_not_found", url.origin));
  }

  // 1. Determine the final role
  // We prioritize existing role in metadata to prevent accidental role changes during sign-in
  const existingRole = user.user_metadata?.role;
  let finalRole = existingRole;

  // 2. If no existing role, validate and set the requested role
  if (!finalRole && requestedRole && ALLOWED_ROLES.includes(requestedRole)) {
    finalRole = requestedRole;
    const { error: updateError } = await supabase.auth.updateUser({
      data: { role: finalRole },
    });
    
    if (updateError) {
      console.error("[auth] failed to update user role:", updateError.message);
    }
  }

  // 3. Determine redirect path
  let redirectPath = nextParam ?? "/";
  
  // If no explicit next param, redirect based on role
  if (!nextParam && finalRole) {
    if (finalRole === "student") redirectPath = "/student";
    else if (finalRole === "teacher") redirectPath = "/teacher";
    else if (finalRole === "admin") redirectPath = "/admin";
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
