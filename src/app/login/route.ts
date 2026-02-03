import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString() ?? "";
  const from = formData.get("from")?.toString() || "/";

  if (email === "admin@gmail.com" && password === "admin") {
    const targetPath = from || "/";
    const url = new URL(targetPath, request.url);
    url.searchParams.set("auth", "login-success");

    const response = NextResponse.redirect(url);
    response.cookies.set("session", "admin", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", "invalid");
  if (from) {
    loginUrl.searchParams.set("from", from);
  }

  return NextResponse.redirect(loginUrl);
}
