import { prisma } from "@/libs/prisma"

export async function isAdminEmail(email: string) {
  return (await prisma.admin.findUnique({ where: { email } })) !== null
}

export async function setToken({
  email,
  token,
}: {
  email: string
  token: string
}) {
  return await prisma.auth.create({ data: { email, token } })
}

export async function getToken(token?: string) {
  return await prisma.auth.findUnique({ where: { token } })
}

export async function confirmToken(token?: string) {
  return await prisma.auth.update({
    where: { token },
    data: { confirmedAt: new Date() },
  })
}
