import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const roleRoutes: Record<string, string> = {
  "/teacher": "teacher",
  "/student": "student",
  "/admin": "admin",
};

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const roleKey = Object.keys(roleRoutes).find((route) => pathname.startsWith(route));
  if (!roleKey) return response;

  const requiredRole = roleRoutes[roleKey];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const appMeta = (user?.app_metadata as { role?: string; profile?: boolean } | undefined) ?? {};
  const metaRole = (user?.user_metadata as { role?: string } | undefined)?.role;
  const role = appMeta.role ?? metaRole ?? request.cookies.get("edudocs_role")?.value;
  const hasProfile = appMeta.profile === true || request.cookies.get("edudocs_profile")?.value === "1";

  if (!user || !hasProfile || role !== requiredRole) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = `?auth=${requiredRole}`;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/admin/:path*"],
};
