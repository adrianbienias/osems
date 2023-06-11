import { prisma } from "@/libs/prisma"
import { isEmail } from "@/libs/validators"
import type { List } from "@/modules/lists"
import type { Contact } from "@prisma/client"
import { Prisma } from "@prisma/client"

export type { Contact } from "@prisma/client"
export type ContactWithList = Contact & { list: List }

export async function addContact({
  email,
  listId,
}: {
  email: string
  listId: string
}) {
  if (!isEmail(email)) {
    return Error("Invalid email address")
  }

  email = email.trim().toLowerCase()

  try {
    return await prisma.contact.create({ data: { email, listId } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002": {
          return Error("Contact already exists on the list")
        }
        case "P2003": {
          return Error("List does not exist")
        }
      }
    }

    throw error
  }
}

export async function confirmContact({
  email,
  listId,
}: {
  email: string
  listId: string
}) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { email_listId: { email, listId } },
    })

    if (contact?.confirmedAt) {
      return Error("Contact already confirmed")
    }

    return await prisma.contact.update({
      where: { email_listId: { email, listId } },
      data: { confirmedAt: new Date() },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002": {
          return Error("Contact already exists on the list")
        }
        case "P2025": {
          return Error("Contact does not exist on the list")
        }
      }
    }

    throw error
  }
}

export async function unsubscribeContact({
  email,
  listId,
}: {
  email: string
  listId: string
}) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { email_listId: { email, listId } },
    })

    if (contact?.unsubscribedAt) {
      return Error("Contact already unsubscribed")
    }

    return await prisma.contact.update({
      where: { email_listId: { email, listId } },
      data: { unsubscribedAt: new Date() },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002": {
          return Error("Contact already exists on the list")
        }
        case "P2025": {
          return Error("Contact does not exist on the list")
        }
      }
    }

    throw error
  }
}

export async function getContact({
  email,
  listId,
}: {
  email: string
  listId: string
}) {
  return await prisma.contact.findUnique({
    where: { email_listId: { email, listId } },
  })
}

export async function filterContacts({
  take,
  listId,
}: {
  take?: number
  listId?: string
}) {
  return await prisma.contact.findMany({
    take,
    where: { listId },
    orderBy: { createdAt: "asc" },
    include: { list: { select: { name: true, id: true } } },
  })
}

export async function getContacts({ listId }: { listId?: string }) {
  return await prisma.contact.findMany({ where: { listId } })
}

export async function getAllContacts() {
  return await prisma.contact.findMany()
}

export async function getContactsConfirmedBetweenDates({
  listId,
  confirmedAfter,
  confirmedBefore,
}: {
  listId: string
  confirmedAfter: Date
  confirmedBefore: Date
}) {
  return await prisma.contact.findMany({
    where: {
      listId,
      confirmedAt: { gte: confirmedAfter, lte: confirmedBefore },
      unsubscribedAt: null,
    },
  })
}

export async function getUnsubscribedContacts() {
  return await prisma.contact.findMany({
    where: { unsubscribedAt: { not: null } },
  })
}

export async function getContactById({ id }: { id: string }) {
  return await prisma.contact.findUnique({ where: { id } })
}

export async function updateContact({
  id,
  email,
  listId,
  unsubscribedAt,
}: {
  id: string
  email: string
  listId: string
  unsubscribedAt?: Date | null
}) {
  if (!isEmail(email)) {
    return Error("Invalid email address")
  }

  email = email.trim().toLowerCase()

  try {
    return await prisma.contact.update({
      where: { id },
      data: { email, listId, unsubscribedAt },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002": {
          return Error("Contact already exists on the list")
        }
        case "P2003": {
          return Error("List does not exist")
        }
      }
    }

    throw error
  }
}
