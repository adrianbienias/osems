import { config } from "@/app-config"
import { prisma } from "./prisma"

async function addAdminToDatabase() {
  await prisma.user.create({
    data: { email: config.adminEmail, isAdmin: true },
  })
}
addAdminToDatabase()
