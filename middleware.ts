import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Already authenticated users shouldn't see login
    if (path === "/login" && token) {
      return NextResponse.redirect(new URL("/gallery", req.url))
    }

    // Protect gallery access
    if (path.startsWith("/gallery")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/gallery/:path*", "/login"],
}
