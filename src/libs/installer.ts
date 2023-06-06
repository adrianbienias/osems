import { config } from "@/app-config"
import { prisma } from "@/libs/prisma"
import { appendFileSync } from "fs"
import { generate } from "randomstring"

export function setEnvVariables(envFilePath: string) {
  if (!config.jwtSecret) {
    appendFileSync(
      envFilePath,
      `
# JSON web token secret string for signing and verifying signed tokens
JWT_SECRET=${generate({ length: 64 })}
`
    )

    console.info("JWT_SECRET env variable set automatically")
  }
}

export async function setInitialAdminEmail() {
  const admins = await prisma.admin.findMany()
  if (admins.length > 0) {
    return console.info("Admin is already set", admins)
  }

  const email = config.initialAdminEmail
  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  console.info("Initial admin email set", admin)
}
