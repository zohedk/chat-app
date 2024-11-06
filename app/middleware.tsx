export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXT_AUTH_SECRET });

  const pathname = req.nextUrl.pathname;
  //
  const isPublicPath =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  //
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  //
  const isAuthPath = pathname === "/";
  //
  if (isAuthPath && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/login", "/signup"],
};
