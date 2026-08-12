import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "next-auth.session-token-delivaryboy";
const PUBLIC_AUTH_ROUTES = new Set([
  "/signin",
  "/forgot-password",
  "/otp",
  "/change-password",
  "/login-success",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: SESSION_COOKIE_NAME,
  });

  const isAuthenticated = Boolean(
    token && token.role === "admin" && token.accessToken,
  );

  if (PUBLIC_AUTH_ROUTES.has(pathname)) {
    if (isAuthenticated && pathname === "/signin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
