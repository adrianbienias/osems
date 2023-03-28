import { config, SIGNUP_FORM_ACTIONS } from "@/app-config"
import { createConfirmationUrl } from "@/libs/urls"
import { isEmail } from "@/libs/validators"
import { getList } from "@/modules/lists"
import { sendEmail } from "@/modules/sendings"
import { getTemplate, parseTemplateVariables } from "@/modules/templates"
import { NextApiRequest, NextApiResponse } from "next"
import {
  addContact,
  confirmContact,
  unsubscribeContact,
} from "./contacts.model"

export async function contactsPostHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, listId } = req.body as { email?: string; listId?: string }

  if (!listId) {
    return res.status(400).json({ error: "Missing list id" })
  }

  const list = await getList({ id: listId })
  if (list instanceof Error) {
    return res.status(500).json({ error: list.message })
  }
  if (!list) {
    return res.status(500).json({ error: "List does not exist" })
  }

  if (!email || !isEmail(email)) {
    switch (config.signupFormAction) {
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
          `${config.signupFormErrorUrl}?${searchParams.toString()}`
        )
      }
    }
  }

  const contact = await addContact({ email, listId: listId })
  if (contact instanceof Error) {
    switch (config.signupFormAction) {
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
          `${config.signupFormErrorUrl}?${searchParams.toString()}`
        )
      }
    }
  }

  const confirmationTemplate = await getTemplate({
    id: list.confirmationTemplateId,
  })
  if (confirmationTemplate instanceof Error) {
    return res.status(500).json({ error: confirmationTemplate.message })
  }
  if (confirmationTemplate === null) {
    return res.status(500).json({ error: "Missing confirmation template" })
  }

  const { id, createdAt, ...template } = confirmationTemplate
  const confirmationUrl = createConfirmationUrl({ email, listId })
  const messageVariables: Map<string, string> = new Map([
    ["{{confirmation}}", confirmationUrl],
  ])
  const message = {
    to: email,
    ...parseTemplateVariables({
      message: template,
      messageVariables,
    }),
  }

  await sendEmail(message)

  switch (config.signupFormAction) {
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

export async function contactsGetHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { email, listId, action } = req.query as {
    email?: string
    listId?: string
    action?: string
  }
  if (!email) {
    switch (config.signupFormAction) {
      case SIGNUP_FORM_ACTIONS.api: {
        return res.status(400).json({ error: "Missing email" })
      }
      case SIGNUP_FORM_ACTIONS.redirect: {
        const searchParams = new URLSearchParams([["error", "Missing email"]])

        return res.redirect(
          `${config.signupFormErrorUrl}?${searchParams.toString()}`
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
  if (list instanceof Error) {
    return res.status(500).json({ error: list.message })
  }
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
