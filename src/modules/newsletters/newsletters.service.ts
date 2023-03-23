import { wait } from "@/libs/datetime"
import { prisma } from "@/libs/prisma"
import { createUnsubscribeUrl } from "@/libs/urls"
import { getContactsToExclude, getContactsToSend } from "@/modules/contacts"
import { getList } from "@/modules/lists"
import { sendEmail } from "@/modules/sendings"
import { getTemplate, parseTemplateVariables } from "@/modules/templates"
import { Contact, Newsletter } from "@prisma/client"
import { getScheduledNewsletters } from "./newsletters.model"

// If SMTP server allows to send e.g. 14 emails per second, set it to a lower value
// to leave some room for the autoresponder (that can use the spare value)
// e.g. if newsletter sending rate is set to 10 emails per sec, it will give a room to autoresponder to use the spare 4 emails per sec
const sendingRatePerSecond = 10

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
    const list = await getList({ id: newsletter.listIdToInclude })

    if (list instanceof Error) {
      return console.error(list.message)
    }
    if (list === null) {
      return console.error("List to send newsletter does not exist")
    }
    if (list.contacts.length < 1) {
      return console.error("No contacts on the list to send newsletter")
    }

    const listIdsToExclude = JSON.parse(newsletter.listIdsToExclude)
    const contactsToInclude = list.contacts
    const contactsToExclude = await getContactsToExclude({ listIdsToExclude })
    if (contactsToExclude instanceof Error) {
      return console.error(contactsToExclude.message)
    }

    const contactsToSend = getContactsToSend({
      contactsToInclude,
      contactsToExclude,
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
      from: newsletter.from,
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

    await wait(1000 / sendingRatePerSecond)
  }

  await prisma.newsletter.update({
    where: { id: newsletter.id },
    data: { sentAt: new Date(), isSending: false },
  })
}
