export const SIGNUP_FORM_ACTIONS = {
  redirect: "redirect",
  api: "api",
} as const

type FormActions = keyof typeof SIGNUP_FORM_ACTIONS

const signupFormAction = process.env.SIGNUP_FORM_ACTION as FormActions
if (!SIGNUP_FORM_ACTIONS[signupFormAction]) {
  throw new Error("Invalid env SIGNUP_FORM_ACTION")
}

export const config = {
  signupFormErrorUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/public/signup-form-error`,
  signupFormAction,
}
