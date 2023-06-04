import { prisma } from "@/libs/prisma"
import { addTemplate } from "@/modules/templates"
import { Template } from "@prisma/client"

export async function scheduleNewsletter({
  newsletterTemplate,
  listIdToInclude,
  listIdsToExclude,
  toSendAfter,
}: {
  newsletterTemplate: Pick<Template, "subject" | "html">
  listIdToInclude: string
  listIdsToExclude: string
  toSendAfter: Date
}) {
  const template = await addTemplate(newsletterTemplate)

  if (template instanceof Error) {
    return Error(template.message)
  }

  const newsletter = await prisma.newsletter.create({
    data: {
      templateId: template.id,
      listIdToInclude,
      listIdsToExclude,
      toSendAfter,
    },
  })

  return newsletter
}

export async function getScheduledNewsletters() {
  try {
    const newsletters = await prisma.newsletter.findMany({
      where: { sentAt: null, toSendAfter: { lte: new Date() } },
      orderBy: { toSendAfter: "asc" },
    })

    return newsletters
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}

export async function getNewsletters() {
  try {
    const newsletters = await prisma.newsletter.findMany({
      orderBy: { toSendAfter: "desc" },
    })

    return newsletters
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}

export async function getNewsletter({ id }: { id: string }) {
  try {
    return await prisma.newsletter.findUnique({
      where: { id },
      include: { logs: true },
    })
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}
