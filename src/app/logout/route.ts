import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);

  response.cookies.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
