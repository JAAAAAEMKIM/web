import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // This function is called if the request is authorized
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"]
}