// Best practice for instantiating PrismaClient with Next.js:
// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

import { appConfig } from "@/app-config"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (!appConfig.isProduction) {
  globalForPrisma.prisma = prisma
}
