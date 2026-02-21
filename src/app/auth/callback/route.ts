import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "../../../lib/supabase/admin";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ALLOWED_ROLES = ["student", "teacher"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const requestedRole = url.searchParams.get("role");
  const mode = url.searchParams.get("mode") || "signin";

  if (!code) return NextResponse.redirect(new URL("/", url.origin));

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

  const { data: { user }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  
  if (exchangeError || !user) {
    return NextResponse.redirect(new URL("/?error=auth_failed", url.origin));
  }

  const admin = createAdminClient();

  // 1. Fetch existing profile
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // 2. ROLE LOCKING LOGIC: If profile exists, user is LOCKED to that role
  if (profile) {
    // If they tried to "Signup" with a different role, redirect to signin with their REAL role
    if (mode === "signup" && requestedRole && requestedRole !== profile.role) {
      return NextResponse.redirect(
        new URL(`/?info=account_exists&auth=${profile.role}&mode=signin`, url.origin)
      );
    }
    
    // Ensure the metadata matches the DB role (security sync)
    if (user.app_metadata.role !== profile.role) {
      await admin.auth.admin.updateUserById(user.id, {
        app_metadata: { role: profile.role, profile: true }
      });
    }
  }

  // 3. Security: Handle Signin for non-existing users
  if (mode === "signin" && !profile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL(`/?error=account_not_found&auth=${requestedRole || "student"}&mode=signup`, url.origin));
  }

  // 4. Handle New Signup
  const finalRole = profile?.role || (requestedRole && ALLOWED_ROLES.includes(requestedRole) ? requestedRole : "student");

  if (!profile) {
    const meta = (user.user_metadata || {}) as Record<string, any>;
    const fullName = meta.full_name || meta.name || "";
    const givenName = meta.given_name || fullName.split(" ")[0] || "";
    const familyName = meta.family_name || (fullName.includes(" ") ? fullName.slice(fullName.indexOf(" ") + 1) : "");

    await admin.from("profiles").upsert({
      id: user.id,
      first_name: givenName || null,
      last_name: familyName || null,
      email: user.email,
      role: finalRole,
      avatar_url: meta.avatar_url || meta.picture || null,
    });

    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { role: finalRole, profile: true }
    });
  }

  // 5. Final Redirect
  let redirectPath = finalRole === "teacher" ? "/teacher" : "/student";
  if (nextParam && nextParam.startsWith(`/${finalRole}`)) {
    redirectPath = nextParam;
  }

  const response = NextResponse.redirect(new URL(redirectPath, url.origin));
  const cookieOptions = { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" as const };
  response.cookies.set("edudocs_role", finalRole, cookieOptions);
  response.cookies.set("edudocs_profile", "1", cookieOptions);
  return response;
}
