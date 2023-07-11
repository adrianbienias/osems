import type { ApiResponse } from "@/libs/types"
import type { Template } from "@/modules/templates"
import { getTemplate, updateTemplate } from "@/modules/templates"
import type { NextApiRequest, NextApiResponse } from "next"
import type {
  Autoresponder,
  AutoresponderWithTemplate,
} from "./autoresponders.model"
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
  const { listId, delayDays, subject, markdown } = req.body as {
    listId?: string
    delayDays?: string
    subject?: string
    markdown?: string
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
  if (!markdown) {
    return res.status(400).json({ error: "Missing markdown content" })
  }
  if (!markdown?.includes("{{unsubscribe}}")) {
    return res
      .status(400)
      .json({ error: "Missing {{unsubscribe}} in markdown content" })
  }

  const autoresponder = await addAutoresponder({
    autoresponderTemplate: {
      subject,
      markdown,
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
  let listId = req.query.listId?.toString()
  if (listId === "undefined" || listId === "") {
    listId = undefined
  }

  const autoresponders = await filterAutoresponders({ listId })
  const autorespondersWithTemplates: AutoresponderWithTemplate[] = []
  for (const autoresponder of autoresponders) {
    const template = await getTemplate({ id: autoresponder.templateId })
    if (!template) {
      return res.status(400).json({ error: "Missing template" })
    }

    const autoresponderWithTemplate = { ...autoresponder, template }
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
  if (!autoresponder) {
    return res.status(400).json({ error: "No autoresponder with provided id" })
  }

  const template = await getTemplate({ id: autoresponder.templateId })
  if (!template) {
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
  const { listId, delayDays, subject, markdown } = req.body as {
    listId?: string
    delayDays?: string
    subject?: string
    markdown?: string
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
  if (!markdown) {
    return res.status(400).json({ error: "Missing markdown content" })
  }
  if (!markdown?.includes("{{unsubscribe}}")) {
    return res
      .status(400)
      .json({ error: "Missing {{unsubscribe}} in markdown content" })
  }

  const autoresponder = await updateAutoresponder({
    id: autoresponderId,
    listId,
    delayDays: Number(delayDays),
  })

  const template = await updateTemplate({
    id: autoresponder.templateId,
    subject,
    markdown,
  })
  if (template instanceof Error) {
    return res.status(400).json({ error: template.message })
  }

  return res.status(200).json({ success: "Ok", autoresponder, template })
}
