import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const url = new URL(request.url);

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

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const admin = createAdminClient();
    
    // 1. Delete the user from auth.users (cascade will handle public.profiles)
    const { error } = await admin.auth.admin.deleteUser(user.id);
    
    if (error) {
      console.error("[auth] delete account failed:", error.message);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    // 2. Sign out the current session
    await supabase.auth.signOut();
  }

  const response = NextResponse.redirect(new URL("/", url.origin), {
    status: 302,
  });

  // 3. Clear all helper cookies
  const clearOptions = { path: "/", maxAge: 0 };
  response.cookies.set("edudocs_role", "", clearOptions);
  response.cookies.set("edudocs_profile", "", clearOptions);
  response.cookies.set("edudocs_auth", "", clearOptions);

  return response;
}
