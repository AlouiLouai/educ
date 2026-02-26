import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const roleRoutes: Record<string, string> = {
  "/teacher": "teacher",
  "/student": "student",
  "/admin": "admin",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Identify if this is a protected route
  const roleKey = Object.keys(roleRoutes).find((route) => pathname.startsWith(route));
  
  // 2. PERFORMANCE SHORT-CIRCUIT:
  // If we are NOT on a protected route (like the home page or auth callback),
  // we can skip the expensive getUser() call in middleware.
  // We still run updateSession to refresh cookies, but only for role-based routes.
  if (!roleKey) {
    return NextResponse.next();
  }

  // 3. Only perform identity-sensitive logic for protected routes
  const { response, user } = await updateSession(request);
  const requiredRole = roleRoutes[roleKey];

  const appMeta = (user?.app_metadata as { role?: string; profile?: boolean } | undefined) ?? {};
  const userMeta = (user?.user_metadata as { role?: string } | undefined) ?? {};
  const cookieRole = request.cookies.get("edudocs_role")?.value;
  
  const role = appMeta.role || userMeta.role || cookieRole;
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
  matcher: [
    /*
     * Optimized Matcher: Only intercept routes that actually need session management.
     */
    "/teacher/:path*",
    "/student/:path*",
    "/admin/:path*",
    "/auth/callback",
  ],
};
