import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  if (pathname === "/login" || pathname === "/logout") {
    return NextResponse.next();
  }

  const session = request.cookies.get("session")?.value;
  const isLoggedIn = session === "admin";

  if (!isLoggedIn) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};
