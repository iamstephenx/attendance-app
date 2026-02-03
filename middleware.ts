import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  // Auth is now handled in individual pages using cookies() and redirect().
  // Middleware simply lets all requests pass through.
  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};
