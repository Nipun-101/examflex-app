import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  LOGOUT_RESUME_PATH_COOKIE,
} from "@/lib/auth/cookie-names";
import {
  DEFAULT_POST_LOGIN_PATH,
  getSafeRedirectPath,
  isSafeRedirectPath,
} from "@/lib/auth/safe-redirect";

const protectedRoutes = [
  "/today",
  "/mocks",
  "/equation-book",
  "/mistake-book",
  "/analysis",
  "/profile",
];

const authRoutes = ["/login"];
const landingPath = "/";

function hasAuthSession(request: NextRequest): boolean {
  const marker = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  if (marker) return true;
  return Boolean(request.cookies.get(AUTH_TOKEN_COOKIE)?.value);
}

function redirectAuthenticatedUser(request: NextRequest): NextResponse {
  const fromQuery = request.nextUrl.searchParams.get("redirect");
  const fromCookie = request.cookies.get(LOGOUT_RESUME_PATH_COOKIE)?.value;

  let targetPath = DEFAULT_POST_LOGIN_PATH;
  if (fromQuery && isSafeRedirectPath(fromQuery)) {
    targetPath = getSafeRedirectPath(fromQuery);
  } else if (fromCookie && isSafeRedirectPath(fromCookie)) {
    targetPath = getSafeRedirectPath(fromCookie);
  }

  const res = NextResponse.redirect(new URL(targetPath, request.url));
  res.cookies.set(LOGOUT_RESUME_PATH_COOKIE, "", {
    maxAge: 0,
    path: "/",
  });
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = hasAuthSession(request);

  // Allow Google OAuth return on landing even if a stale session cookie exists.
  if (
    pathname === landingPath &&
    (request.nextUrl.searchParams.has("code") ||
      request.nextUrl.searchParams.has("error"))
  ) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isLanding = pathname === landingPath;

  if (isProtectedRoute && !token) {
    const returnTo = `${pathname}${request.nextUrl.search}`;
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", returnTo);
    return NextResponse.redirect(loginUrl);
  }

  if (token && (isLanding || isAuthRoute)) {
    return redirectAuthenticatedUser(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
