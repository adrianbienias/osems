import { addList, getLists } from "@/modules/lists"
import { addTemplate } from "@/modules/templates"
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
    case "POST": {
      return await handleAddList({ req, res })
    }
    case "GET": {
      return await handleGetLists({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}

async function handleAddList({
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

  if (!name) {
    return res.status(400).json({ error: "Missing list name" })
  }
  if (!from) {
    return res.status(400).json({ error: "Missing sender (from)" })
  }
  if (!signupRedirectUrl) {
    return res.status(400).json({ error: "Missing signup redirect url" })
  }
  if (!confirmationRedirectUrl) {
    return res.status(400).json({ error: "Missing confirmation redirect url" })
  }
  if (!unsubscribeRedirectUrl) {
    return res.status(400).json({ error: "Missing unsubscribe redirect url" })
  }
  if (!subject) {
    return res.status(400).json({ error: "Missing subject" })
  }
  if (!html) {
    return res.status(400).json({ error: "Missing email template" })
  }
  if (!html.includes("{{confirmation}}")) {
    return res
      .status(400)
      .json({ error: "Missing {{confirmation}} in email template" })
  }

  const confirmationTemplate = await addTemplate({ subject, html })
  if (confirmationTemplate instanceof Error) {
    return res.status(400).json({ error: confirmationTemplate.message })
  }

  const confirmationTemplateId = confirmationTemplate.id
  const list = await addList({
    name,
    from,
    signupRedirectUrl,
    confirmationRedirectUrl,
    unsubscribeRedirectUrl,
    confirmationTemplateId,
  })

  if (list instanceof Error) {
    return res.status(400).json({ error: list.message })
  }

  return res.status(200).json({ success: "List added", list })
}

async function handleGetLists({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<Response>
}) {
  const lists = await getLists()
  if (lists instanceof Error) {
    return res.status(400).json({ error: lists.message })
  }

  return res.status(200).json({ success: "Ok", lists })
}
