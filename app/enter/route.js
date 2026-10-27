import { NextResponse } from "next/server";
import { COOKIE, isValidToken } from "@/lib/auth";

export async function GET(request) {
  const k = request.nextUrl.searchParams.get("k");
  if (!isValidToken(k)) return new NextResponse(null, { status: 404 });

  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set(COOKIE, k, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
