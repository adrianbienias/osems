import { prisma } from "@/libs/prisma"
import { addTemplate } from "@/modules/templates"
import { Template } from "@prisma/client"

type AutoresponderTemplate = Pick<Template, "subject" | "html">

export async function addAutoresponder({
  autoresponderTemplate,
  listId,
  delayDays,
}: {
  autoresponderTemplate: AutoresponderTemplate
  listId: string
  delayDays: number
}) {
  const template = await addTemplate(autoresponderTemplate)
  if (template instanceof Error) {
    return Error(template.message)
  }

  const autoresponder = await prisma.autoresponder.create({
    data: {
      templateId: template.id,
      listId,
      delayDays,
    },
  })

  return autoresponder
}

export async function filterAutoresponders({
  take,
  listId,
}: {
  take?: number
  listId?: string
}) {
  try {
    return await prisma.autoresponder.findMany({
      take,
      where: { listId },
      orderBy: { delayDays: "asc" },
      include: { list: true },
    })
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}

export async function getAutoresponder({ id }: { id: string }) {
  try {
    return await prisma.autoresponder.findUnique({
      where: { id },
    })
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}

export async function getAutoresponders() {
  try {
    return await prisma.autoresponder.findMany()
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}

export async function updateAutoresponder({
  id,
  listId,
  delayDays,
}: {
  id: string
  listId?: string
  delayDays?: number
}) {
  try {
    return await prisma.autoresponder.update({
      where: {
        id,
      },
      data: {
        delayDays,
        listId,
      },
    })
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}
