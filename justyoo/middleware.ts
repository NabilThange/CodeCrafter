import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require an active session (userId cookie)
const PROTECTED_ROUTES = ["/dashboard", "/portfolio", "/kuberaa"];

// API routes that require auth
const PROTECTED_API = ["/api/kuberaa"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userId = request.cookies.get("userId")?.value;

  const isProtectedPage = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  const isProtectedApi  = PROTECTED_API.some(r => pathname.startsWith(r));

  // Redirect to onboarding if no session on protected routes
  if (isProtectedPage && !userId) {
    const loginUrl = new URL("/onboarding", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Inject userId into API request headers for downstream use
  if (isProtectedApi && userId) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", userId);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portfolio/:path*",
    "/kuberaa/:path*",
    "/api/kuberaa/:path*",
  ],
};
