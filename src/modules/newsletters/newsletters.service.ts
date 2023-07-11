import { appConfig } from "@/app-config"
import { wait } from "@/libs/datetime"
import { createUnsubscribeUrl } from "@/libs/urls"
import { getContactsToSend } from "@/modules/contacts"
import { sendEmail } from "@/modules/sendings"
import {
  convertTemplateHtmlToText,
  getTemplate,
  parseTemplateVariables,
} from "@/modules/templates"
import { marked } from "marked"
import type { Newsletter } from "./newsletters.model"
import {
  checkIfNewsletterIsSending,
  createNewsletterLog,
  getScheduledNewsletters,
  setNewsletterSendingIdle,
  setNewsletterSendingInProgress,
  updateNewsletter,
} from "./newsletters.model"

export async function sendNewsletters() {
  const newsletters = await getScheduledNewsletters()
  if (newsletters.length < 1) {
    return
  }

  if (await checkIfNewsletterIsSending()) {
    return console.info("Busy... sending newsletter in progress")
  }

  await setNewsletterSendingInProgress()

  for (const newsletter of newsletters) {
    try {
      await sendNewsletter(newsletter)
    } catch (error) {
      console.error(error)
    }
  }

  await setNewsletterSendingIdle()
}

async function sendNewsletter(newsletter: Newsletter) {
  const newsletterId = newsletter.id
  const listId = newsletter.listId
  const listIdsToExclude = JSON.parse(newsletter.listIdsToExclude)

  const contacts = await getContactsToSend({ listId, listIdsToExclude })
  if (contacts.length < 1) {
    await updateNewsletter({ newsletterId, sentAt: new Date() })

    return console.error("No active contacts on the list to send newsletter")
  }

  const newsletterTemplate = await getTemplate({
    id: newsletter.templateId,
  })
  if (!newsletterTemplate) {
    return console.error("Missing newsletter template")
  }

  const { id, createdAt, ...template } = newsletterTemplate
  const html = marked
    .parse(template.markdown)
    .replaceAll("%7B", "{")
    .replaceAll("%7D", "}")
  const emailTemplate = {
    subject: template.subject,
    html,
    text: convertTemplateHtmlToText(html),
  }

  for (const contact of contacts) {
    const email = contact.email
    const unsubscribeUrl = createUnsubscribeUrl({ email, listId })
    const messageVariables: Map<string, string> = new Map([
      // Here you can set all kinds of newsletter template variables
      // Example: ["{{email}}", email]
      ["{{unsubscribe}}", unsubscribeUrl],
    ])
    const message = {
      to: email,
      ...parseTemplateVariables({
        message: emailTemplate,
        messageVariables,
      }),
    }

    await sendEmail(message)
    await createNewsletterLog({ email, newsletterId })

    await wait(1000 / appConfig.maxSendRatePerSecondNewsletter)
  }

  await updateNewsletter({ newsletterId, sentAt: new Date() })
}
