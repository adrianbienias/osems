import { withAuth } from "next-auth/middleware"

/**
 * Process NextAuth through Next.js middleware
 * https://next-auth.js.org/configuration/nextjs#middleware
 */
export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      if (process.env.NODE_ENV !== "production") {
        // Be default authorization in non production environments is disabled.
        // If you want to test authorization in development environment, simply comment out the following line:
        return true
      }

      // Treat request as authorized only if the token is present
      if (token) {
        return true
      }

      // Treat all other cases as non authorized (redirect to login page)
      return false
    },
  },
})

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * api/v1/public/
   * public/
   */
  matcher: ["/((?!api/v1/public/|public/).*)"],
}
