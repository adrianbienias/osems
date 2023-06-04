import type { ApiResponse } from "@/libs/types"
import type { Template } from "@/modules/templates"
import { getTemplate, updateTemplate } from "@/modules/templates"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Autoresponder } from "./autoresponders.model"
import {
  addAutoresponder,
  filterAutoresponders,
  getAutoresponder,
  updateAutoresponder,
} from "./autoresponders.model"

export async function handlePostAutoresponders({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse
}) {
  const { listId, delayDays, subject, html } = req.body as {
    listId?: string
    delayDays?: string
    subject?: string
    html?: string
  }
  if (!listId) {
    return res.status(400).json({ error: "Missing list id" })
  }
  if (!delayDays) {
    return res.status(400).json({ error: "Missing delay days" })
  }
  if (!subject) {
    return res.status(400).json({ error: "Missing subject" })
  }
  if (!html) {
    return res.status(400).json({ error: "Missing html content" })
  }

  const autoresponder = await addAutoresponder({
    autoresponderTemplate: {
      subject,
      html,
    },
    listId,
    delayDays: Number(delayDays),
  })

  return res.status(200).json({ success: "Ok", autoresponder })
}

export async function handleGetAutoresponders({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<
    ApiResponse & {
      autoresponders?: (Autoresponder & {
        template: Template
      })[]
    }
  >
}) {
  let listId = req.query.listId as string | undefined
  if (listId === "undefined" || listId === "") {
    listId = undefined
  }

  const autoresponders = await filterAutoresponders({ listId })
  if (autoresponders instanceof Error) {
    return res.status(400).json({ error: autoresponders.message })
  }

  const autorespondersWithTemplates = []
  for (const autoresponder of autoresponders) {
    const template = await getTemplate({
      id: autoresponder.templateId,
    })
    if (template instanceof Error) {
      return res.status(400).json({ error: template.message })
    }
    if (!template) {
      return res.status(400).json({ error: "Missing template" })
    }

    const autoresponderWithTemplate: Autoresponder & {
      template: Template
    } = {
      ...autoresponder,
      template,
    }

    autorespondersWithTemplates.push(autoresponderWithTemplate)
  }

  return res
    .status(200)
    .json({ success: "Ok", autoresponders: autorespondersWithTemplates })
}

export async function handleGetAutoresponder({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<
    ApiResponse & { autoresponder?: Autoresponder; template?: Template }
  >
}) {
  const autoresponderId = req.query.autoresponderId
  if (typeof autoresponderId !== "string") {
    return res.status(400).json({ error: "Invalid autoresponder id" })
  }

  const autoresponder = await getAutoresponder({ id: autoresponderId })
  if (autoresponder instanceof Error) {
    return res.status(400).json({ error: autoresponder.message })
  }
  if (autoresponder === null) {
    return res.status(400).json({ error: "No autoresponder with provided id" })
  }

  const template = await getTemplate({ id: autoresponder.templateId })
  if (template instanceof Error) {
    return res.status(400).json({ error: template.message })
  }
  if (template === null) {
    return res.status(400).json({ error: "No template with provided id" })
  }

  return res.status(200).json({ success: "Ok", autoresponder, template })
}

export async function handlePatchAutoresponder({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<
    ApiResponse & { autoresponder?: Autoresponder; template?: Template }
  >
}) {
  const { listId, delayDays, subject, html } = req.body as {
    listId?: string
    delayDays?: string
    subject?: string
    html?: string
  }

  const { autoresponderId } = req.query
  if (!autoresponderId || typeof autoresponderId !== "string") {
    return res.status(400).json({ error: "Missing autoresponder id" })
  }

  if (!listId) {
    return res.status(400).json({ error: "Missing list id" })
  }
  if (!delayDays) {
    return res.status(400).json({ error: "Missing delay days" })
  }
  if (!subject) {
    return res.status(400).json({ error: "Missing subject" })
  }
  if (!html) {
    return res.status(400).json({ error: "Missing html content" })
  }

  const autoresponder = await updateAutoresponder({
    id: autoresponderId,
    listId,
    delayDays: Number(delayDays),
  })
  if (autoresponder instanceof Error) {
    return res.status(400).json({ error: autoresponder.message })
  }

  const template = await updateTemplate({
    id: autoresponder.templateId,
    subject,
    html,
  })
  if (template instanceof Error) {
    return res.status(400).json({ error: template.message })
  }

  return res.status(200).json({ success: "Ok", autoresponder, template })
}
