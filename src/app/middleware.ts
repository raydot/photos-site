import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isUploadPath = req.nextUrl.pathname.startsWith("/upload")

    if (isUploadPath && token?.role !== "uploader") {
      return NextResponse.redirect(new URL("/gallery", req.url))
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
  matcher: ["/gallery/:path*", "/upload/:path*"],
}
