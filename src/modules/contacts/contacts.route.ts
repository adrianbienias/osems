import { appConfig, SIGNUP_FORM_ACTIONS } from "@/app-config"
import type { ApiResponse } from "@/libs/types"
import { createConfirmationUrl } from "@/libs/urls"
import { isEmail } from "@/libs/validators"
import { getList } from "@/modules/lists"
import { sendEmail } from "@/modules/sendings"
import {
  convertTemplateHtmlToText,
  getTemplate,
  parseTemplateVariables,
} from "@/modules/templates"
import { parse as csvParse } from "csv-parse/sync"
import { marked } from "marked"
import type { NextApiRequest, NextApiResponse } from "next"
import {
  addContact,
  addContacts,
  confirmContact,
  Contact,
  filterContacts,
  getContactById,
  unsubscribeContact,
  updateContact,
} from "./contacts.model"

export async function contactsPostHandler({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse
}) {
  const { email, listId } = req.body as { email?: string; listId?: string }

  if (!listId) {
    return res.status(400).json({ error: "Missing list id" })
  }

  const list = await getList({ id: listId })
  if (!list) {
    return res.status(400).json({ error: "List does not exist" })
  }

  if (!email || !isEmail(email)) {
    switch (appConfig.signupFormAction) {
      case SIGNUP_FORM_ACTIONS.api: {
        return res.status(400).json({ error: "Invalid email address" })
      }
      case SIGNUP_FORM_ACTIONS.redirect: {
        const searchParams = new URLSearchParams([
          ["error", "Invalid email address"],
          ["listId", listId],
        ])

        // Explicitly set redirect code to 302, because Next.js set it to 307 by default.
        // That causes preserving POST method in redirect request.
        // https://nextjs.org/docs/api-reference/next/server#why-does-redirect-use-307-and-308
        return res.redirect(
          302,
          `${appConfig.signupFormErrorUrl}?${searchParams.toString()}`
        )
      }
    }
  }

  const contact = await addContact({ email, listId: listId })
  if (contact instanceof Error) {
    switch (appConfig.signupFormAction) {
      case SIGNUP_FORM_ACTIONS.api: {
        return res.status(400).json({ error: contact.message })
      }
      case SIGNUP_FORM_ACTIONS.redirect: {
        const searchParams = new URLSearchParams([
          ["error", contact.message],
          ["listId", listId],
        ])

        // Explicitly set redirect code to 302, because Next.js set it to 307 by default.
        // That causes preserving POST method in redirect request.
        // https://nextjs.org/docs/api-reference/next/server#why-does-redirect-use-307-and-308
        return res.redirect(
          302,
          `${appConfig.signupFormErrorUrl}?${searchParams.toString()}`
        )
      }
    }
  }

  const confirmationTemplate = await getTemplate({
    id: list.confirmationTemplateId,
  })
  if (!confirmationTemplate) {
    return res.status(500).json({ error: "Missing confirmation template" })
  }

  const { id, createdAt, ...template } = confirmationTemplate
  const html = marked
    .parse(template.markdown)
    .replaceAll("%7B", "{")
    .replaceAll("%7D", "}")
  const emailTemplate = {
    subject: template.subject,
    html,
    text: convertTemplateHtmlToText(html),
  }
  const confirmationUrl = createConfirmationUrl({ email, listId })
  const messageVariables: Map<string, string> = new Map([
    ["{{confirmation}}", confirmationUrl],
  ])
  const message = {
    to: email,
    ...parseTemplateVariables({
      message: emailTemplate,
      messageVariables,
    }),
  }

  await sendEmail(message)

  switch (appConfig.signupFormAction) {
    case SIGNUP_FORM_ACTIONS.api: {
      return res.status(200).json({
        success: "Contact subscribed",
        contact,
        signupRedirectUrl: list.signupRedirectUrl,
      })
    }
    case SIGNUP_FORM_ACTIONS.redirect: {
      // Explicitly set redirect code to 302, because Next.js set it to 307 by default.
      // That causes preserving POST method in redirect request.
      // https://nextjs.org/docs/api-reference/next/server#why-does-redirect-use-307-and-308
      return res.redirect(302, list.signupRedirectUrl)
    }
  }
}

export async function contactsGetHandler({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse>
}) {
  let { email, listId, action } = req.query as {
    email?: string
    listId?: string
    action?: string
  }
  if (!email) {
    switch (appConfig.signupFormAction) {
      case SIGNUP_FORM_ACTIONS.api: {
        return res.status(400).json({ error: "Missing email" })
      }
      case SIGNUP_FORM_ACTIONS.redirect: {
        const searchParams = new URLSearchParams([["error", "Missing email"]])

        return res.redirect(
          `${appConfig.signupFormErrorUrl}?${searchParams.toString()}`
        )
      }
    }
  }
  if (!listId) {
    return res.status(400).json({ error: "Missing list id" })
  }
  if (!action) {
    return res.status(400).json({ error: "Missing action parameter" })
  }

  email = decodeURIComponent(email)

  const list = await getList({ id: listId })
  if (!list) {
    return res.status(400).json({ error: "List does not exist" })
  }

  let contact = null

  switch (action) {
    case "confirm": {
      contact = await confirmContact({ email, listId })
      if (contact instanceof Error) {
        return res.status(400).json({ error: contact.message })
      }

      return res.redirect(list.confirmationRedirectUrl)
    }
    case "unsubscribe": {
      contact = await unsubscribeContact({ email, listId })
      if (contact instanceof Error) {
        return res.status(400).json({ error: contact.message })
      }

      return res.redirect(list.unsubscribeRedirectUrl)
    }
    default: {
      return res.status(400).json({ error: "Invalid action parameter" })
    }
  }
}

export async function handleGetContacts({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse & { contacts?: Contact[] }>
}) {
  let listId = req.query.listId as string | undefined
  if (listId === "undefined" || listId === "") {
    listId = undefined
  }

  const contacts = await filterContacts({ listId })

  return res.status(200).json({ success: "Ok", contacts })
}

export async function handlePostContact({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse
}) {
  const { email, listId } = req.body as { email?: string; listId?: string }

  if (!listId) {
    return res.status(400).json({ error: "Missing list id" })
  }

  const list = await getList({ id: listId })
  if (!list) {
    return res.status(400).json({ error: "List does not exist" })
  }

  if (!email || !isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" })
  }

  const contact = await addContact({ email, listId: listId })
  if (contact instanceof Error) {
    return res.status(400).json({ error: contact.message })
  }

  await confirmContact({ email, listId })

  return res.status(200).json({ success: "Contact created", contact })
}

export async function handleGetContact({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse & { contact?: Contact }>
}) {
  const contactId = req.query.contactId
  if (typeof contactId !== "string") {
    return res.status(400).json({ error: "Invalid contact id" })
  }

  const contact = await getContactById({ id: contactId })
  if (!contact) {
    return res.status(400).json({ error: "No contact with provided id" })
  }

  return res.status(200).json({ success: "Ok", contact })
}

export async function handlePatchContact({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse & { contact?: Contact }>
}) {
  let { email, listId, unsubscribedAt } = req.body as {
    email?: string
    listId?: string
    unsubscribedAt?: string
  }

  const { contactId } = req.query
  if (!contactId || typeof contactId !== "string") {
    return res.status(400).json({ error: "Missing contact id" })
  }

  if (!email || !isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" })
  }

  if (!listId) {
    return res.status(400).json({ error: "Missing list id" })
  }
  const list = await getList({ id: listId })
  if (!list) {
    return res.status(400).json({ error: "List does not exist" })
  }

  let unsubscribedAtDate = null
  if (unsubscribedAt) {
    unsubscribedAtDate = new Date(unsubscribedAt)
  }

  const contact = await updateContact({
    id: contactId,
    email,
    listId,
    unsubscribedAt: unsubscribedAtDate,
  })
  if (contact instanceof Error) {
    return res.status(400).json({ error: contact.message })
  }

  return res.status(200).json({ success: "Ok", contact })
}

export async function handlePostUploadContacts({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse & { contact?: Contact }>
}) {
  const csvFileContent = req.body
  if (!csvFileContent) {
    return res.status(400).json({ error: "Invalid or empty file" })
  }

  try {
    const contacts = csvParse(csvFileContent, {
      columns: true,
      trim: true,
      skip_empty_lines: true,
      relax_column_count: true,
    })

    await addContacts({ contacts })

    return res.status(200).json({ success: "Contacts added" })
  } catch (error) {
    console.error(error)

    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(400).json({ error: "Undefined error" })
  }
}
