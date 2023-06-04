import { config } from "@/app-config"
import { wait } from "@/libs/datetime"
import { createUnsubscribeUrl } from "@/libs/urls"
import type { Contact } from "@/modules/contacts"
import { getContactsToSend } from "@/modules/contacts"
import { sendEmail } from "@/modules/sendings"
import { getTemplate, parseTemplateVariables } from "@/modules/templates"
import type { Newsletter } from "./newsletters.model"
import {
  checkIfNewsletterIsSending,
  createNewsletterLog,
  getScheduledNewsletters,
  setNewsletterSendingIdle,
  setNewsletterSendingInProgress,
  updateNewsletter,
  updateNewsletterLog,
} from "./newsletters.model"

export async function sendNewsletters() {
  const newsletters = await getScheduledNewsletters()
  if (newsletters instanceof Error) {
    return console.error(newsletters.message)
  }

  const isNewsletterSending = await checkIfNewsletterIsSending()
  if (isNewsletterSending) {
    return console.info("Busy... sending newsletter in progress")
  }

  await setNewsletterSendingInProgress()

  for (const newsletter of newsletters) {
    await sendNewsletter({ newsletter })
  }

  await setNewsletterSendingIdle()
}

async function sendNewsletter({ newsletter }: { newsletter: Newsletter }) {
  const contacts = await getContactsToSend({
    listIdToInclude: newsletter.listIdToInclude,
    listIdsToExclude: JSON.parse(newsletter.listIdsToExclude),
  })
  if (contacts.length < 1) {
    const newsletterId = newsletter.id
    await updateNewsletter({ newsletterId, sentAt: new Date() })

    return console.error("No active contacts on the list to send newsletter")
  }

  const newsletterTemplate = await getTemplate({
    id: newsletter.templateId,
  })
  if (newsletterTemplate instanceof Error) {
    return console.error(newsletterTemplate.message)
  }
  if (newsletterTemplate === null) {
    return console.error("Missing newsletter template")
  }
  const { id, createdAt, ...template } = newsletterTemplate
  const newsletterId = newsletter.id

  for (const contact of contacts) {
    const email = contact.email
    const listId = newsletter.listIdToInclude.toString()
    const unsubscribeUrl = createUnsubscribeUrl({ email, listId })
    const messageVariables: Map<string, string> = new Map([
      // Here you can set all kinds of newsletter template variables
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
      await createNewsletterLog({ email, newsletterId })
      await sendEmail(message)
      await updateNewsletterLog({ email, newsletterId, sentAt: new Date() })
    } catch (error) {
      console.error(error)
    }

    await wait(1000 / config.maxSendRatePerSecondNewsletter)
  }

  await updateNewsletter({ newsletterId, sentAt: new Date() })
}
