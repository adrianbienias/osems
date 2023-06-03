export function isEmail(email: string): boolean {
  const emailRegex = /\S+@\S+\.\S+/
  return emailRegex.test(email)
}

export const uuidRegex = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/
