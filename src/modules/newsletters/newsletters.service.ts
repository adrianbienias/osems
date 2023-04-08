import { config } from "@/app-config"
import { wait } from "@/libs/datetime"
import { prisma } from "@/libs/prisma"
import { createUnsubscribeUrl } from "@/libs/urls"
import { getContactsToSend } from "@/modules/contacts"
import { sendEmail } from "@/modules/sendings"
import { getTemplate, parseTemplateVariables } from "@/modules/templates"
import { Contact, Newsletter } from "@prisma/client"
import { getScheduledNewsletters } from "./newsletters.model"

export async function sendNewsletters() {
  const newsletters = await getScheduledNewsletters()
  if (newsletters instanceof Error) {
    return console.error(newsletters.message)
  }

  const sendingInProgress = newsletters.find(
    (newsletter) => newsletter.isSending === true
  )
  if (sendingInProgress) {
    return console.info("Busy... sending newsletter in progress")
  }

  for (const newsletter of newsletters) {
    const contactsToSend = await getContactsToSend({
      listIdToInclude: newsletter.listIdToInclude,
      listIdsToExclude: JSON.parse(newsletter.listIdsToExclude),
    })

    if (contactsToSend.length < 1) {
      await prisma.newsletter.update({
        where: { id: newsletter.id },
        data: { sentAt: new Date() },
      })

      return console.error("No active contacts on the list to send newsletter")
    }

    await sendNewsletter({ newsletter, contacts: contactsToSend })
  }
}

async function sendNewsletter({
  newsletter,
  contacts,
}: {
  newsletter: Newsletter
  contacts: Contact[]
}) {
  await prisma.newsletter.update({
    where: { id: newsletter.id },
    data: { isSending: true },
  })

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
      await prisma.sending.create({
        data: { email, newsletterId: newsletter.id },
      })

      await sendEmail(message)

      await prisma.sending.update({
        where: { email_newsletterId: { email, newsletterId: newsletter.id } },
        data: { sentAt: new Date() },
      })
    } catch (error) {
      console.error(error)
    }

    await wait(1000 / config.maxSendRatePerSecond)
  }

  await prisma.newsletter.update({
    where: { id: newsletter.id },
    data: { sentAt: new Date(), isSending: false },
  })
}
