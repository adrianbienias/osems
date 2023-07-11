import { appConfig } from "@/app-config"
import type { ApiResponse } from "@/libs/types"
import { isEmail } from "@/libs/validators"
import { signAdminJwt } from "@/modules/auth"
import { sendEmail } from "@/modules/sendings"
import { convertTemplateHtmlToText } from "@/modules/templates"
import { deleteCookie, setCookie } from "cookies-next"
import type { NextApiRequest, NextApiResponse } from "next"
import { generate } from "randomstring"
import { confirmToken, getToken, isAdminEmail, setToken } from "./auth.model"

export async function handlePostAuth({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse>
}) {
  const { email } = req.body as { email?: string }
  if (!email || !isEmail(email)) {
    return res.status(400).json({ error: "Invalid email" })
  }

  const isAdmin = await isAdminEmail(email)
  if (!isAdmin) {
    return res
      .status(400)
      .json({ error: "Provided email doesn't have admin privileges" })
  }

  const token = generate({ length: 64 })
  await setToken({ email, token })

  const magicLoginLink = `${appConfig.baseUrl}/api/v1/public/auth?token=${token}`
  const html = `<a href="${magicLoginLink}">Click here to log in</a>`
  const subject = "Confirm logging in"
  const preheader = "Click the link in message"
  const template = {
    subject,
    html,
    text: convertTemplateHtmlToText(html),
    preheader,
  }
  await sendEmail({ to: email, ...template })

  return res.status(200).json({ success: "Ok" })
}

export async function handleGetAuth({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse>
}) {
  const { token } = req.query as { token?: string }

  const authRecord = await getToken(token)
  if (!authRecord) {
    return res.status(400).json({ error: "Invalid token" })
  }
  if (authRecord.confirmedAt) {
    return res.status(400).json({ error: "Token already used" })
  }
  const expirationHoursLimit = 1
  const expirationDate = new Date(
    new Date().setHours(new Date().getHours() - expirationHoursLimit)
  )
  if (authRecord.createdAt < expirationDate) {
    return res.status(400).json({ error: "Token expired" })
  }
  const { email } = authRecord

  await confirmToken(token)

  const adminJWT = await signAdminJwt({ email, isAdmin: true })
  setCookie(appConfig.adminJwtCookieName, adminJWT, {
    req,
    res,
    maxAge: appConfig.jwtCookieMaxAge,
  })

  return res.redirect(appConfig.loginPagePath)
}

export async function handleDeleteAuth({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse>
}) {
  deleteCookie(appConfig.adminJwtCookieName, { req, res })

  return res.status(200).json({ success: "Logged out" })
}
