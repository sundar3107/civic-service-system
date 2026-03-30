import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken");

  const needsCitizenAuth =
    pathname.startsWith("/home") || pathname.startsWith("/report") || pathname.startsWith("/complaints");
  const needsAuthorityAuth = pathname.startsWith("/authority/dashboard");

  if (needsCitizenAuth && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (needsAuthorityAuth && !accessToken) {
    return NextResponse.redirect(new URL("/authority/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/home/:path*", "/home", "/report/:path*", "/complaints/:path*", "/authority/dashboard/:path*", "/authority/dashboard"]
};
