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

  // Fallback to home if no code is present
  if (!code) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const cookieStore = await cookies();
  const responseCookies: { name: string; value: string; options?: Parameters<ReturnType<typeof cookies>["set"]>[2] }[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => responseCookies.push(cookie));
        },
      },
    }
  );

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

  // 1. Check if the user was JUST created (new account)
  const createdAt = new Date(user.created_at).getTime();
  const lastSignIn = new Date(user.last_sign_in_at || user.created_at).getTime();
  const isBrandNew = Math.abs(lastSignIn - createdAt) < 10000; // 10 second window

  // 2. Fetch existing profile
  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  let hasProfile = !!profile && !profileError;
  const appMeta = (user.app_metadata || {}) as Record<string, unknown>;
  const appProfile = appMeta.profile === true;

  // 3. Strict Signin Check
  // If no profile exists, block signin regardless of "brand new" status.
  if (mode === "signin" && !hasProfile) {
    // IMPORTANT: Clear the session completely so they aren't 'half-logged-in'
    if (isBrandNew) {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(user.id);
    }
    await supabase.auth.signOut();
    const roleParam = requestedRole && ALLOWED_ROLES.includes(requestedRole) ? requestedRole : "student";
    return NextResponse.redirect(new URL(`/?error=account_not_found&auth=${roleParam}&mode=signup`, url.origin));
  }

  // 4. Handle "Signup" mode: if profile exists, inform user they already have an account
  if (mode === "signup" && hasProfile) {
    const roleParam =
      profile?.role && ALLOWED_ROLES.includes(profile.role) ? profile.role : (requestedRole || "student");
    return NextResponse.redirect(new URL(`/?info=account_exists&auth=${roleParam}&mode=signin`, url.origin));
  }

  // 4b. If this is signup and profile is missing, create it server-side (fast + reliable)
  if (mode === "signup" && !hasProfile) {
    const admin = createAdminClient();
    const fallbackRole =
      requestedRole && ALLOWED_ROLES.includes(requestedRole)
        ? requestedRole
        : (user.user_metadata as { role?: string } | undefined)?.role || "student";

    const meta = (user.user_metadata || {}) as Record<string, string | undefined>;
    const fullName = meta.full_name || meta.name || "";
    const givenName = meta.given_name || fullName.split(" ")[0] || "";
    const familyName =
      meta.family_name || (fullName.includes(" ") ? fullName.slice(fullName.indexOf(" ") + 1) : "");
    const avatarUrl = meta.avatar_url || meta.picture || "";

    await admin.from("profiles").upsert(
      {
        id: user.id,
        first_name: givenName || null,
        last_name: familyName || null,
        email: user.email,
        role: fallbackRole,
        avatar_url: avatarUrl || null,
      },
      { onConflict: "id" }
    );

    profile = { role: fallbackRole };
    hasProfile = true;
  }

  // 5. Determine the final role
  let finalRole = profile?.role || (user.user_metadata as { role?: string } | undefined)?.role;

  // If this is signup, trust the requested role for redirecting
  if (mode === "signup" && requestedRole && ALLOWED_ROLES.includes(requestedRole)) {
    finalRole = requestedRole;
  }

  // Only allow setting/updating role if in signup mode OR if the user somehow has no role
  if (mode === "signup" && requestedRole && ALLOWED_ROLES.includes(requestedRole)) {
    if (finalRole !== requestedRole) {
      await supabase.auth.updateUser({
        data: { role: requestedRole },
      });
      finalRole = requestedRole;
    }
  } 
  
  if (!finalRole) {
    // If no role found and we can't set one, fallback to student but this shouldn't happen for valid users
    finalRole = "student";
  }

  // 6. Ensure profile matches (for consistency)
  if (profile && profile.role !== finalRole) {
     await supabase.from("profiles").update({ role: finalRole }).eq("id", user.id);
  }

  // 7. Stamp app_metadata.profile=true for faster auth checks (once profile exists)
  if (hasProfile && !appProfile) {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...appMeta,
        profile: true,
        role: finalRole,
      },
    });
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
  responseCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  // 4. Set helper cookies for client-side UX (not for security)
  if (finalRole) {
    response.cookies.set("edudocs_role", finalRole, { 
      path: "/", 
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax"
    });
  }
  if (hasProfile) {
    response.cookies.set("edudocs_profile", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }
  response.cookies.set("edudocs_auth", "1", { 
    path: "/", 
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax"
  });

  return response;
}
