import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

  // Check if session exists
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  const response = NextResponse.redirect(new URL("/", url.origin), {
    status: 302,
  });

  // Securely clear all helper cookies
  const clearOptions = { path: "/", maxAge: 0 };
  response.cookies.set("edudocs_role", "", clearOptions);
  response.cookies.set("edudocs_profile", "", clearOptions);
  response.cookies.set("edudocs_auth", "", clearOptions);

  return response;
}
