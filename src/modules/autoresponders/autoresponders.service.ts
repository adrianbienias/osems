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
  getAutoresponders,
  getContactsToSendAutoresponder,
  setAutoresponderSendingIdle,
  setAutoresponderSendingInProgress,
} from "./autoresponders.model"

export async function sendAutoresponders() {
  const autoresponders = await getAutoresponders()
  if (autoresponders.length < 1) {
    return
  }

  if (await checkIfAutoresponderIsSending()) {
    return console.info("Busy... sending autoresponder in progress")
  }

  await setAutoresponderSendingInProgress()

  for (const autoresponder of autoresponders) {
    try {
      await sendAutoresponder(autoresponder)
    } catch (error) {
      console.error(error)
    }
  }

  await setAutoresponderSendingIdle()
}

export async function sendAutoresponder(autoresponder: Autoresponder) {
  const autoresponderId = autoresponder.id
  const listId = autoresponder.listId

  const { confirmedBefore, confirmedAfter } =
    getDateRangeForAutoresponder(autoresponder)

  const contactsFromDateRange = await getContactsConfirmedBetweenDates({
    listId,
    confirmedAfter,
    confirmedBefore,
  })
  if (contactsFromDateRange.length < 1) {
    return
  }

  const contacts = await getContactsToSendAutoresponder({
    contactsFromDateRange,
    autoresponderId,
  })
  if (contacts.length < 1) {
    return
  }

  const autoresponderTemplate = await getTemplate({
    id: autoresponder.templateId,
  })
  if (!autoresponderTemplate) {
    return console.error("Missing newsletter template")
  }

  const { id, createdAt, ...template } = autoresponderTemplate

  for (const contact of contacts) {
    const email = contact.email
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

    await sendEmail(message)
    await createAutoresponderLog({ autoresponderId, email })

    await wait(1000 / appConfig.maxSendRatePerSecondAutoresponder)
  }
}

function getDateRangeForAutoresponder(autoresponder: Autoresponder) {
  const maxDaysDelay = 1 // Prevents sending messages to contacts that had signed up earlier than 1 day before the autoresponder delay value

  const now = new Date()
  const confirmedBefore = new Date()
  const confirmedAfter = new Date()
  confirmedBefore.setDate(now.getDate() - autoresponder.delayDays)
  confirmedAfter.setDate(now.getDate() - autoresponder.delayDays - maxDaysDelay)

  return { confirmedBefore, confirmedAfter }
}
