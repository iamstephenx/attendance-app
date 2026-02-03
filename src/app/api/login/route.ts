import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const rawFrom = formData.get("from");

  const email = rawEmail ? rawEmail.toString().trim().toLowerCase() : "";
  const password = rawPassword ? rawPassword.toString().trim() : "";
  const from = rawFrom ? rawFrom.toString() || "/" : "/";

  if (email === "admin@gmail.com" && password.toLowerCase() === "admin") {
    const targetPath = from || "/";
    const url = new URL(targetPath, request.url);

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
