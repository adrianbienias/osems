import { prisma } from "@/libs/prisma"
import type { List } from "@/modules/lists"
import type { Template } from "@/modules/templates"
import { addTemplate } from "@/modules/templates"
import { SETTINGS } from "@/settings"
import type { Autoresponder } from "@prisma/client"

export type { Autoresponder } from "@prisma/client"
export type AutoresponderWithTemplate = Autoresponder & { template: Template }
export type AutoresponderWithListAndTemplate = Autoresponder & {
  list: List
  template: Template
}

export async function addAutoresponder({
  autoresponderTemplate,
  listId,
  delayDays,
}: {
  autoresponderTemplate: Pick<Template, "subject" | "html">
  listId: string
  delayDays: number
}) {
  const template = await addTemplate(autoresponderTemplate)
  if (template instanceof Error) {
    return template
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
  return await prisma.autoresponder.findMany({
    take,
    where: { listId },
    orderBy: { delayDays: "asc" },
    include: { list: true },
  })
}

export async function getAutoresponder({ id }: { id: string }) {
  return await prisma.autoresponder.findUnique({
    where: { id },
  })
}

export async function getAutoresponders() {
  return await prisma.autoresponder.findMany()
}

export async function updateAutoresponder({
  id,
  delayDays,
  listId,
}: {
  id: string
  delayDays?: number
  listId?: string
}) {
  return await prisma.autoresponder.update({
    where: {
      id,
    },
    data: {
      delayDays,
      listId,
    },
  })
}

export async function checkIfAutoresponderIsSending() {
  const sendingStatus = await prisma.setting.findUnique({
    where: { key: SETTINGS.autoresponder_sending_status.key },
  })

  return (
    sendingStatus?.value ===
    SETTINGS.autoresponder_sending_status.values.in_progress
  )
}

export async function setAutoresponderSendingInProgress() {
  await prisma.setting.upsert({
    where: { key: SETTINGS.autoresponder_sending_status.key },
    update: { value: SETTINGS.autoresponder_sending_status.values.in_progress },
    create: {
      key: SETTINGS.autoresponder_sending_status.key,
      value: SETTINGS.autoresponder_sending_status.values.in_progress,
    },
  })
}

export async function setAutoresponderSendingIdle() {
  await prisma.setting.upsert({
    where: { key: SETTINGS.autoresponder_sending_status.key },
    update: { value: SETTINGS.autoresponder_sending_status.values.idle },
    create: {
      key: SETTINGS.autoresponder_sending_status.key,
      value: SETTINGS.autoresponder_sending_status.values.idle,
    },
  })
}

export async function getAutoresponderLog({
  autoresponderId,
  email,
}: {
  autoresponderId: string
  email: string
}) {
  return await prisma.autoresponderLog.findUnique({
    where: { email_autoresponderId: { autoresponderId, email } },
  })
}

export async function createAutoresponderLog({
  autoresponderId,
  email,
}: {
  autoresponderId: string
  email: string
}) {
  await prisma.autoresponderLog.create({
    data: { autoresponderId, email },
  })
}

export async function updateAutoresponderLog({
  autoresponderId,
  email,
  sentAt,
}: {
  autoresponderId: string
  email: string
  sentAt: Date
}) {
  await prisma.autoresponderLog.update({
    where: { email_autoresponderId: { autoresponderId, email } },
    data: { sentAt },
  })
}

export async function getAutoresponderLogs() {
  return await prisma.autoresponderLog.findMany()
}
