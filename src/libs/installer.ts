import { config } from "@/app-config"
import { prisma } from "./prisma"

export async function runInstaller() {
  console.log("Installer run")

  const email = config.adminEmail
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  console.info(`Admin email set as "${email}"`)
}
