import { appConfig } from "@/app-config"
import { SignJWT, jwtVerify } from "jose"

export async function verifyJwt(token: string) {
  const secret = new TextEncoder().encode(appConfig.jwtSecret)
  const { payload } = await jwtVerify(token, secret)

  return payload
}

export async function signAdminJwt(payload: {
  email: string
  isAdmin: boolean
}) {
  const secret = new TextEncoder().encode(appConfig.jwtSecret)

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .sign(secret)
}
