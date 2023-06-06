const isServer = typeof window === "undefined"

export const SIGNUP_FORM_ACTIONS = {
  redirect: "redirect",
  api: "api",
} as const
type FormActions = keyof typeof SIGNUP_FORM_ACTIONS

const APP_ENVS = {
  production: "production",
  development: "development",
  test: "test",
} as const
type AppEnvs = keyof typeof APP_ENVS

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("Missing env NEXT_PUBLIC_BASE_URL")
}
if (!process.env.NEXT_PUBLIC_EMAIL_FROM) {
  throw new Error("Missing env NEXT_PUBLIC_EMAIL_FROM")
}

if (isServer) {
  if (!process.env.APP_ENV) {
    throw new Error("Missing env APP_ENV")
  }
  if (!APP_ENVS[process.env.APP_ENV as AppEnvs]) {
    throw new Error("Invalid env APP_ENV")
  }
  if (!process.env.SIGNUP_FORM_ACTION) {
    throw new Error("Missing env SIGNUP_FORM_ACTION")
  }
  if (!SIGNUP_FORM_ACTIONS[process.env.SIGNUP_FORM_ACTION as FormActions]) {
    throw new Error("Invalid env SIGNUP_FORM_ACTION")
  }
  if (!process.env.INITIAL_ADMIN_EMAIL) {
    throw new Error("Missing env INITIAL_ADMIN_EMAIL")
  }
  if (!process.env.EMAIL_SERVER_HOST) {
    throw new Error("Missing env EMAIL_SERVER_HOST")
  }
  if (!process.env.EMAIL_SERVER_PORT) {
    throw new Error("Missing env EMAIL_SERVER_PORT")
  }
  if (!process.env.EMAIL_SERVER_USER) {
    throw new Error("Missing env EMAIL_SERVER_USER")
  }
  if (!process.env.EMAIL_SERVER_PASSWORD) {
    throw new Error("Missing env EMAIL_SERVER_PASSWORD")
  }
  if (!process.env.MAX_SEND_RATE_PER_SECOND_NEWSLETTER) {
    throw new Error("Missing env MAX_SEND_RATE_PER_SECOND_NEWSLETTER")
  }
  if (!process.env.MAX_SEND_RATE_PER_SECOND_AUTORESPONDER) {
    throw new Error("Missing env MAX_SEND_RATE_PER_SECOND_AUTORESPONDER")
  }
}

export const config = {
  isProduction: process.env.APP_ENV === APP_ENVS.production,
  isDevelopment: process.env.APP_ENV === APP_ENVS.development,
  isTest: process.env.APP_ENV === APP_ENVS.test,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  initialAdminEmail: process.env.INITIAL_ADMIN_EMAIL!,
  signupFormAction: process.env.SIGNUP_FORM_ACTION as FormActions,
  signupFormSubmitUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/public/contacts`,
  signupFormErrorUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/public/signup-form-error`,
  sender: process.env.NEXT_PUBLIC_EMAIL_FROM,
  smtp: {
    host: process.env.EMAIL_SERVER_HOST!,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER!,
      pass: process.env.EMAIL_SERVER_PASSWORD!,
    },
  },
  maxSendRatePerSecondNewsletter: Number(
    process.env.MAX_SEND_RATE_PER_SECOND_NEWSLETTER
  ),
  maxSendRatePerSecondAutoresponder: Number(
    process.env.MAX_SEND_RATE_PER_SECOND_AUTORESPONDER
  ),
  jwtSecret: process.env.JWT_SECRET,
  jwtCookieMaxAge: 60 * 60 * 24 * 31, // 31 days
  adminJwtCookieName: "adminJWT",
  loginPagePath: "/public/login",
}
