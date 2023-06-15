import { appConfig } from "@/app-config"
import { prisma } from "@/libs/prisma"

export async function setInitialAdminEmail() {
  const admins = await prisma.admin.findMany()
  if (admins.length > 0) {
    return console.info("Admin is already set", admins)
  }

  const email = appConfig.initialAdminEmail
  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  console.info("Initial admin email set", admin)
}
