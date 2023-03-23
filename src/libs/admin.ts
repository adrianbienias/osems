import { prisma } from "./prisma"

async function addAdminToDatabase() {
  const email = process.env.ADMIN_EMAIL
  if (!email) {
    throw new Error("Invalid env ADMIN_EMAIL")
  }

  const isAdmin = true
  await prisma.user.create({ data: { email, isAdmin } })
}
addAdminToDatabase()
