import { appConfig } from "@/app-config"
import { wait } from "@/libs/datetime"
import { createUnsubscribeUrl } from "@/libs/urls"
import { getContactsConfirmedBetweenDates } from "@/modules/contacts"
import { sendEmail } from "@/modules/sendings"
import { getTemplate, parseTemplateVariables } from "@/modules/templates"
import {
  Autoresponder,
  checkIfAutoresponderIsSending,
  createAutoresponderLog,
  getAutoresponderLog,
  getAutoresponders,
  setAutoresponderSendingIdle,
  setAutoresponderSendingInProgress,
  updateAutoresponderLog,
} from "./autoresponders.model"

export async function sendAutoresponders() {
  const autoresponders = await getAutoresponders()
  if (autoresponders instanceof Error) {
    return console.error(autoresponders.message)
  }
  if (autoresponders.length < 1) {
    return // No autoresponders to send
  }

  if (await checkIfAutoresponderIsSending()) {
    return console.info("Busy... sending autoresponder in progress")
  }

  await setAutoresponderSendingInProgress()

  for (const autoresponder of autoresponders) {
    await sendAutoresponder(autoresponder)
  }

  await setAutoresponderSendingIdle()
}

export async function sendAutoresponder(autoresponder: Autoresponder) {
  const now = new Date()
  const maxDaysDelay = 1 // Prevents sending messages to contacts that had signed up earlier than 1 day before the autoresponder delay value
  const confirmedBefore = new Date()
  const confirmedAfter = new Date()
  confirmedBefore.setDate(now.getDate() - autoresponder.delayDays)
  confirmedAfter.setDate(now.getDate() - autoresponder.delayDays - maxDaysDelay)

  const listId = autoresponder.listId
  const contacts = await getContactsConfirmedBetweenDates({
    listId,
    confirmedAfter,
    confirmedBefore,
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

    // TODO: Exclude contacts by existing autoresponder logs before iterating them
    if (await getAutoresponderLog({ autoresponderId, email })) {
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
      await createAutoresponderLog({ autoresponderId, email })
      await sendEmail(message)
      await updateAutoresponderLog({
        autoresponderId,
        email,
        sentAt: new Date(),
      })
    } catch (error) {
      console.error(error)
    }

    await wait(1000 / appConfig.maxSendRatePerSecondAutoresponder)
  }
}
