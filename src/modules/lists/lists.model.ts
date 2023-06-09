import { prisma } from "@/libs/prisma"
import type { List } from "@prisma/client"
import { Prisma } from "@prisma/client"

export type { List } from "@prisma/client"
export type ListWithCount = List & { _count: { contacts: number } }

export async function addList({
  name,
  signupRedirectUrl,
  confirmationRedirectUrl,
  unsubscribeRedirectUrl,
  confirmationTemplateId,
}: {
  name: string
  signupRedirectUrl: string
  confirmationRedirectUrl: string
  unsubscribeRedirectUrl: string
  confirmationTemplateId: string
}) {
  try {
    return await prisma.list.create({
      data: {
        name,
        confirmationTemplateId,
        signupRedirectUrl,
        confirmationRedirectUrl,
        unsubscribeRedirectUrl,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return Error("List with provided name already exists")
      }
    }

    console.error(error)

    return Error("Internal Server Error")
  }
}

export async function getList({ id }: { id: string }) {
  try {
    return await prisma.list.findUnique({ where: { id } })
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}

export async function getListWithContacts({ id }: { id: string }) {
  try {
    return await prisma.list.findUnique({
      where: { id },
      include: { contacts: true },
    })
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}

export async function getLists() {
  try {
    return await prisma.list.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { contacts: true } } },
    })
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}

export async function getListsByIds(ids: string[]) {
  return await prisma.list.findMany({
    where: { id: { in: ids } },
  })
}

export async function getAllLists() {
  return await prisma.list.findMany()
}

export async function updateList({
  id,
  name,
  signupRedirectUrl,
  confirmationRedirectUrl,
  unsubscribeRedirectUrl,
}: {
  id: string
  name?: string
  signupRedirectUrl?: string
  confirmationRedirectUrl?: string
  unsubscribeRedirectUrl?: string
}) {
  try {
    return await prisma.list.update({
      where: {
        id,
      },
      data: {
        name,
        signupRedirectUrl,
        confirmationRedirectUrl,
        unsubscribeRedirectUrl,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return Error("List with provided name already exists")
      }
    }

    console.error(error)

    return Error("Internal Server Error")
  }
}
