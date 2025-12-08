import { NextResponse } from "next/server";

// Middleware left intentionally minimal: routing/auth handled client-side.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|auth).*)"]
};
