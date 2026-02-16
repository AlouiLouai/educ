import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleRoutes: Record<string, string> = {
  "/teacher": "teacher",
  "/student": "student",
  "/admin": "admin",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleKey = Object.keys(roleRoutes).find((route) => pathname.startsWith(route));
  if (!roleKey) return NextResponse.next();

  const requiredRole = roleRoutes[roleKey];
  const isAuthed = request.cookies.get("edudocs_auth")?.value === "1";
  const role = request.cookies.get("edudocs_role")?.value;

  if (!isAuthed || role !== requiredRole) {
    const url = request.nextUrl.clone();
    url.pathname = `/auth/${requiredRole}`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/admin/:path*"],
};
