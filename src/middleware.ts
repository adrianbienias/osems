import { appConfig } from "@/app-config"
import { jwtVerify } from "jose"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/**
 * Duplicated function (defined in auth module) because of the following error:
 * "The edge runtime does not support Node.js 'stream' module simple import"
 *
 * TODO: Investigate and fix it
 * @see https://github.com/vercel/examples/tree/main/edge-middleware/jwt-authentication
 */
async function verifyJwt(token: string) {
  const secret = new TextEncoder().encode(appConfig.jwtSecret)
  const { payload } = await jwtVerify(token, secret)

  return payload
}

/**
 * Verifies JWT from cookie in Next.js middleware.
 * Renews if it's valid, redirects to login page if it's not.
 * @see https://nextjs.org/docs/pages/building-your-application/routing/middleware
 */
async function handleJwtMiddleware({ req }: { req: NextRequest }) {
  const redirectUrl = new URL(appConfig.loginPagePath, req.url)

  const adminJwt = req.cookies.get(appConfig.adminJwtCookieName)?.value
  if (!adminJwt || typeof adminJwt !== "string") {
    return NextResponse.redirect(redirectUrl)
  }

  try {
    const decodedJwt = await verifyJwt(adminJwt)
    if (!decodedJwt.isAdmin) {
      return NextResponse.redirect(redirectUrl)
    }

    const response = NextResponse.next()
    renewAdminJwtCookie({ response, adminJwt })

    return response
  } catch (error) {
    console.error(error)

    return NextResponse.redirect(redirectUrl)
  }
}

/**
 * Renews cookie expiration date (maxAge) by mutating response object.
 * @see https://nextjs.org/docs/pages/building-your-application/routing/middleware#using-cookies
 */
function renewAdminJwtCookie({
  response,
  adminJwt,
}: {
  response: NextResponse
  adminJwt: string
}) {
  response.cookies.set({
    name: appConfig.adminJwtCookieName,
    value: adminJwt,
    maxAge: appConfig.jwtCookieMaxAge,
  })
}

/**
 * Next.js middleware
 * @see https://nextjs.org/docs/pages/building-your-application/routing/middleware
 *
 * It runs on the edge, thus there's no way to check the database on each request natively.
 * To use Node.js runtime, API endpoint has to be called via fetch (as a workaround).
 * @see https://github.com/vercel/next.js/discussions/46722
 */
export async function middleware(req: NextRequest) {
  if (appConfig.isProduction) {
    // To turn on authentication in development environment, simply move the handler outside the if statement
    return await handleJwtMiddleware({ req })
  }
}

/**
 * Filters Middleware to run on specific paths
 * @see https://nextjs.org/docs/pages/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - /_next
     * - /api/v1/public
     * - /public
     */
    "/((?!_next|api/v1/public|public).*)",
  ],
}
