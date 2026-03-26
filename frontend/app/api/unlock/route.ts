import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { passphrase } = await request.json();
  const expected = process.env.SITE_PASSPHRASE;

  if (!expected || passphrase !== expected) {
    return NextResponse.json({ error: "Incorrect passphrase" }, { status: 401 });
  }

  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const response = NextResponse.json({ ok: true, redirect: next });

  response.cookies.set("dome_unlocked", expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // 30-day session
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
