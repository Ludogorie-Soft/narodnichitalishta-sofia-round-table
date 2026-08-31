import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { localeFromPathname } from "@/lib/i18n";
import { applySecurityHeaders } from "@/lib/security-headers";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = localeFromPathname(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  const isAdmin = pathname.startsWith("/admin");
  const isLogin =
    pathname === "/admin/login" || pathname.startsWith("/admin/login/");
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (isAdmin && !isLogin && !hasSessionCookie) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("from", pathname);
    const redirect = NextResponse.redirect(login);
    applySecurityHeaders(redirect.headers);
    return redirect;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  applySecurityHeaders(response.headers);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/).*)"],
};
