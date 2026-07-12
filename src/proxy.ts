import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { type NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

async function proxyHandler(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (auth as any)(req);
    return result;
  } catch {
    // If auth crashes (e.g. bad AUTH_URL or missing secret), fall back to
    // a simple cookie-based check: no cookie → redirect to login.
    const hasCookie =
      req.cookies.has("authjs.session-token") ||
      req.cookies.has("__Secure-authjs.session-token") ||
      req.cookies.has("next-auth.session-token") ||
      req.cookies.has("__Secure-next-auth.session-token");
    if (!hasCookie) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

export default proxyHandler;

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
