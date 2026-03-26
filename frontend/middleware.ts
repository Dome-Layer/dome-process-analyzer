import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/unlock", "/api/unlock", "/auth/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets and public paths
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const passphrase = process.env.SITE_PASSPHRASE;

  // If no passphrase is configured, allow all traffic (local dev without env var)
  if (!passphrase) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("dome_unlocked");
  if (cookie?.value === passphrase) {
    return NextResponse.next();
  }

  const unlockUrl = request.nextUrl.clone();
  unlockUrl.pathname = "/unlock";
  unlockUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
