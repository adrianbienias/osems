import { prisma } from "@/libs/prisma"
import { isEmail } from "@/libs/validators"
import { Prisma } from "@prisma/client"

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

    console.error(error)

    return Error("Internal Server Error")
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

    console.error(error)

    return Error("Internal Server Error")
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

    console.error(error)

    return Error("Internal Server Error")
  }
}
