import { prisma } from "@/libs/prisma"
import type { List } from "@/modules/lists"
import type { Template } from "@/modules/templates"
import { addTemplate } from "@/modules/templates"
import { SETTINGS } from "@/settings"
import type { Newsletter } from "@prisma/client"

export type { Newsletter } from "@prisma/client"
export type NewsletterWithTemplate = Newsletter & { template: Template }
export type NewsletterWithListAndTemplate = Newsletter & {
  list: List
  template: Template
}

export async function scheduleNewsletter({
  newsletterTemplate,
  listId,
  listIdsToExclude,
  toSendAfter,
}: {
  newsletterTemplate: Pick<Template, "subject" | "preheader" | "markdown">
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
  const newsletters = await prisma.newsletter.findMany({
    where: { sentAt: null, toSendAfter: { lte: new Date() } },
    orderBy: { toSendAfter: "asc" },
  })

  return newsletters
}

export async function getNewsletters(filters: { listId?: string } = {}) {
  const { listId } = filters
  const newsletters = await prisma.newsletter.findMany({
    orderBy: { toSendAfter: "asc" },
    where: { listId },
    include: { list: true },
  })

  return newsletters
}

export async function getNewsletter({ id }: { id: string }) {
  return await prisma.newsletter.findUnique({
    where: { id },
    include: { logs: true, list: true },
  })
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
  sentAt = new Date(),
}: {
  email: string
  newsletterId: string
  sentAt?: Date
}) {
  await prisma.newsletterLog.create({ data: { email, newsletterId, sentAt } })
}

export async function getNewsletterLogs() {
  return await prisma.newsletterLog.findMany()
}
