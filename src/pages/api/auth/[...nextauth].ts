import { prisma } from "@/libs/prisma"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { NextAuthOptions, User } from "next-auth"
import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // Using adapter makes session strategy to be set as "database"
  // That leads to an issue with handling middleware, token is null thus there's permanent redirect to login page
  // Setting strategy to "jwt" solves the problem
  // https://next-auth.js.org/configuration/nextjs#caveats
  session: { strategy: "jwt" },

  providers: [
    // https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/src/providers/email.ts
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],

  callbacks: {
    async signIn({ user }: { user: User }) {
      const email = user.email
      if (!email) {
        return false
      }

      const userData = await prisma.user.findUnique({ where: { email } })
      if (userData?.isAdmin !== true) {
        return false
      }

      return true
    },
  },
}

export default NextAuth(authOptions)
