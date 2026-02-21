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

  // Use Admin Client for database operations to bypass RLS and ensure success
  const admin = createAdminClient();

  // 1. Verify if user exists in our DB
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // 2. Security: Handle Signin for non-existing users
  if (mode === "signin" && !profile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL(`/?error=account_not_found&auth=${requestedRole || "student"}&mode=signup`, url.origin));
  }

  // 3. Handle Signup or Update
  const finalRole = (mode === "signup" && requestedRole && ALLOWED_ROLES.includes(requestedRole)) 
    ? requestedRole 
    : (profile?.role || "student");

  if (mode === "signup" || !profile) {
    const meta = (user.user_metadata || {}) as Record<string, any>;
    const fullName = meta.full_name || meta.name || "";
    const givenName = meta.given_name || fullName.split(" ")[0] || "";
    const familyName = meta.family_name || (fullName.includes(" ") ? fullName.slice(fullName.indexOf(" ") + 1) : "");

    // Force sync the profile using Admin client
    await admin.from("profiles").upsert({
      id: user.id,
      first_name: givenName || null,
      last_name: familyName || null,
      email: user.email,
      role: finalRole,
      avatar_url: meta.avatar_url || meta.picture || null,
    });

    // Update Auth Metadata (both user_metadata and app_metadata)
    // app_metadata is better for roles as it's not user-editable
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, role: finalRole, signup: "true" },
      app_metadata: { role: finalRole, profile: true }
    });
  }

  // 4. Redirect Logic
  let redirectPath = finalRole === "teacher" ? "/teacher" : "/student";
  if (nextParam && nextParam.startsWith(`/${finalRole}`)) {
    redirectPath = nextParam;
  }

  const response = NextResponse.redirect(new URL(redirectPath, url.origin));

  // Set helper cookies for the middleware and client
  const cookieOptions = { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" as const };
  response.cookies.set("edudocs_role", finalRole, cookieOptions);
  response.cookies.set("edudocs_profile", "1", cookieOptions);
  response.cookies.set("edudocs_auth", "1", cookieOptions);

  return response;
}
