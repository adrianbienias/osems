import { prisma } from "@/libs/prisma"
import type { Template } from "@/modules/templates"
import { addTemplate } from "@/modules/templates"
import { SETTINGS } from "@/settings"
import type { Newsletter } from "@prisma/client"

export type { Newsletter } from "@prisma/client"
export type NewsletterWithTemplate = Newsletter & { template: Template }

export async function scheduleNewsletter({
  newsletterTemplate,
  listId,
  listIdsToExclude,
  toSendAfter,
}: {
  newsletterTemplate: Pick<Template, "subject" | "html">
  listId: string
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
      listId,
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

export async function getNewsletters(filters: { listId?: string } = {}) {
  const { listId } = filters
  try {
    const newsletters = await prisma.newsletter.findMany({
      orderBy: { toSendAfter: "desc" },
      where: { listId },
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

export async function updateNewsletter({
  newsletterId,
  sentAt,
}: {
  newsletterId: string
  sentAt: Date
}) {
  await prisma.newsletter.update({
    where: { id: newsletterId },
    data: { sentAt },
  })
}

export async function checkIfNewsletterIsSending() {
  const sendingStatus = await prisma.setting.findUnique({
    where: { key: SETTINGS.newsletter_sending_status.key },
  })

  return (
    sendingStatus?.value ===
    SETTINGS.newsletter_sending_status.values.in_progress
  )
}

export async function setNewsletterSendingInProgress() {
  await prisma.setting.upsert({
    where: { key: SETTINGS.newsletter_sending_status.key },
    update: { value: SETTINGS.newsletter_sending_status.values.in_progress },
    create: {
      key: SETTINGS.newsletter_sending_status.key,
      value: SETTINGS.newsletter_sending_status.values.in_progress,
    },
  })
}

export async function setNewsletterSendingIdle() {
  await prisma.setting.upsert({
    where: { key: SETTINGS.newsletter_sending_status.key },
    update: { value: SETTINGS.newsletter_sending_status.values.idle },
    create: {
      key: SETTINGS.newsletter_sending_status.key,
      value: SETTINGS.newsletter_sending_status.values.idle,
    },
  })
}

export async function createNewsletterLog({
  email,
  newsletterId,
}: {
  email: string
  newsletterId: string
}) {
  await prisma.newsletterLog.create({
    data: { email, newsletterId },
  })
}

export async function getNewsletterLogs() {
  return await prisma.newsletterLog.findMany()
}

export async function updateNewsletterLog({
  email,
  newsletterId,
  sentAt,
}: {
  email: string
  newsletterId: string
  sentAt: Date
}) {
  await prisma.newsletterLog.update({
    where: { email_newsletterId: { email, newsletterId } },
    data: { sentAt },
  })
}
