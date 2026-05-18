import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // NextAuth v5 usa "authjs.session-token" (HTTP) o "__Secure-authjs.session-token" (HTTPS)
    const secure = req.url.startsWith("https");
    const cookieName = secure ? "__Secure-authjs.session-token" : "authjs.session-token";

    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
      cookieName,
    });

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
