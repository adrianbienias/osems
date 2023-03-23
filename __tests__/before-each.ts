import { prisma } from "@/libs/prisma"

export async function cleanDatabase() {
  const tablesToDelete = [
    // Order matters because of relations
    "Sending",
    "Newsletter",
    "Template",
    "Contact",
    "List",
  ]

  for (const table of tablesToDelete) {
    await prisma.$executeRawUnsafe(`DELETE FROM ${table};`)
  }
}
