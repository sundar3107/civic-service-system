import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken");

  if (pathname === "/" && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/authority/dashboard") && !accessToken) {
    return NextResponse.redirect(new URL("/authority/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/authority/dashboard"]
};
