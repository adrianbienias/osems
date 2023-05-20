import { config } from "@/app-config"
import { wait } from "@/libs/datetime"
import { prisma } from "@/libs/prisma"
import { createUnsubscribeUrl } from "@/libs/urls"
import { sendEmail } from "@/modules/sendings"
import { getTemplate, parseTemplateVariables } from "@/modules/templates"
import { SETTINGS } from "@/settings"
import { Autoresponder } from "@prisma/client"
import { getAutoresponders } from "./autoresponders.model"

export async function sendAutoresponders() {
  const autoresponders = await getAutoresponders()
  if (autoresponders instanceof Error) {
    return console.error(autoresponders.message)
  }
  if (autoresponders.length < 1) {
    return // No autoresponders to send
  }

  const sendingStatus = await prisma.settings.findUnique({
    where: { key: SETTINGS.sending_status.key },
  })
  if (sendingStatus?.value === SETTINGS.sending_status.values.in_progress) {
    return console.info("Busy... sending autoresponder in progress")
  }

  await prisma.settings.upsert({
    where: { key: SETTINGS.sending_status.key },
    update: { value: SETTINGS.sending_status.values.in_progress },
    create: {
      key: SETTINGS.sending_status.key,
      value: SETTINGS.sending_status.values.in_progress,
    },
  })

  for (const autoresponder of autoresponders) {
    await sendAutoresponder(autoresponder)
  }

  await prisma.settings.update({
    where: { key: SETTINGS.sending_status.key },
    data: { value: SETTINGS.sending_status.values.idle },
  })
}

export async function sendAutoresponder(autoresponder: Autoresponder) {
  const maxDaysDelay = 1 // Prevents sending messages to contacts that had signed up earlier than 1 day before the autoresponder delay value
  const now = new Date()
  const dateToSendBefore = new Date()
  const dateToSendAfter = new Date()
  dateToSendBefore.setDate(now.getDate() - autoresponder.delayDays)
  dateToSendAfter.setDate(
    now.getDate() - autoresponder.delayDays - maxDaysDelay
  )

  const contacts = await prisma.contact.findMany({
    where: {
      listId: autoresponder.listId,
      confirmedAt: { gte: dateToSendAfter, lte: dateToSendBefore },
      unsubscribedAt: null,
    },
  })

  const autoresponderTemplate = await getTemplate({
    id: autoresponder.templateId,
  })
  if (autoresponderTemplate instanceof Error) {
    return console.error(autoresponderTemplate.message)
  }
  if (autoresponderTemplate === null) {
    return console.error("Missing newsletter template")
  }
  const { id, createdAt, ...template } = autoresponderTemplate

  for (const contact of contacts) {
    const autoresponderId = autoresponder.id
    const email = contact.email
    const listId = autoresponder.listId

    // TODO: Rethink this
    // It's not efficient to query DB for each contact
    // Possible solution: exclude contacts by existing autoresponder logs before iterating all of them
    const existingLog = await prisma.autoresponderLogs.findUnique({
      where: { email_autoresponderId: { autoresponderId, email } },
    })
    if (existingLog) {
      continue // Autoresponder has been already sent to this contact
    }

    const unsubscribeUrl = createUnsubscribeUrl({ email, listId })
    const messageVariables: Map<string, string> = new Map([
      // Here you can set all kinds of autoresponder template variables
      ["{{email}}", email],
      ["{{unsubscribe}}", unsubscribeUrl],
    ])
    const message = {
      to: email,
      ...parseTemplateVariables({
        message: template,
        messageVariables,
      }),
    }

    try {
      await prisma.autoresponderLogs.create({
        data: { email, autoresponderId },
      })

      await sendEmail(message)

      await prisma.autoresponderLogs.update({
        where: { email_autoresponderId: { email, autoresponderId } },
        data: { sentAt: new Date() },
      })
    } catch (error) {
      console.error(error)
    }

    await wait(1000 / config.maxSendRatePerSecondAutoresponder)
  }
}
