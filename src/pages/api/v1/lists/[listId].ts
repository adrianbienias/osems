import { getList, updateList } from "@/modules/lists"
import { getTemplate, updateTemplate } from "@/modules/templates"
import { List, Template } from "@prisma/client"
import type { NextApiRequest, NextApiResponse } from "next"

type Response = {
  error?: string
  success?: string
  list?: List
  confirmationTemplate?: Template
  lists?: List[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  switch (req.method) {
    case "PATCH": {
      return await handleUpdateList({ req, res })
    }
    case "GET": {
      return await handleGetList({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}

async function handleUpdateList({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<Response>
}) {
  let {
    name,
    from,
    subject,
    html,
    signupRedirectUrl,
    confirmationRedirectUrl,
    unsubscribeRedirectUrl,
  } = req.body as {
    name?: string
    from?: string
    subject?: string
    html?: string
    signupRedirectUrl?: string
    confirmationRedirectUrl?: string
    unsubscribeRedirectUrl?: string
  }

  const { listId } = req.query

  if (!listId || typeof listId !== "string") {
    return res.status(400).json({ error: "Missing list id" })
  }
  if (name === "") {
    return res.status(400).json({ error: "Missing list name" })
  }
  if (from === "") {
    return res.status(400).json({ error: "Missing sender (from)" })
  }
  if (signupRedirectUrl === "") {
    return res.status(400).json({ error: "Missing signup redirect url" })
  }
  if (confirmationRedirectUrl === "") {
    return res.status(400).json({ error: "Missing confirmation redirect url" })
  }
  if (unsubscribeRedirectUrl === "") {
    return res.status(400).json({ error: "Missing unsubscribe redirect url" })
  }
  if (subject === "") {
    return res.status(400).json({ error: "Missing subject" })
  }
  if (html === "") {
    return res.status(400).json({ error: "Missing email template" })
  }
  if (!html?.includes("{{confirmation}}")) {
    return res
      .status(400)
      .json({ error: "Missing {{confirmation}} in email template" })
  }

  const list = await getList({ id: listId })
  if (list instanceof Error) {
    return Error(list.message)
  }
  if (list === null) {
    return Error("Invalid list id")
  }

  const template = await updateTemplate({
    confirmationTemplateId: list.confirmationTemplateId,
    subject,
    html,
  })

  if (template instanceof Error) {
    return res.status(400).json({ error: template.message })
  }

  const updatedList = await updateList({
    id: listId,
    name,
    from,
    signupRedirectUrl,
    confirmationRedirectUrl,
    unsubscribeRedirectUrl,
  })

  if (updatedList instanceof Error) {
    return res.status(400).json({ error: updatedList.message })
  }

  return res.status(200).json({ success: "List updated", list: updatedList })
}

async function handleGetList({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<Response>
}) {
  const listId = req.query.listId

  if (typeof listId !== "string") {
    return res.status(400).json({ error: "Invalid list id" })
  }

  const list = await getList({ id: listId })

  if (list instanceof Error) {
    return res.status(400).json({ error: list.message })
  }
  if (list === null) {
    return res.status(400).json({ error: "No list with provided id" })
  }

  const confirmationTemplate = await getTemplate({
    id: list.confirmationTemplateId,
  })

  if (confirmationTemplate instanceof Error) {
    return res.status(400).json({ error: confirmationTemplate.message })
  }
  if (confirmationTemplate === null) {
    return res.status(400).json({ error: "Missing confirmation template" })
  }

  return res.status(200).json({ success: "Ok", list, confirmationTemplate })
}
