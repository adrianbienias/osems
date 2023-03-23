import { getNewsletter } from "@/modules/newsletters"
import { getTemplate } from "@/modules/templates"
import { Newsletter, Template } from "@prisma/client"
import type { NextApiRequest, NextApiResponse } from "next"

type Response = {
  error?: string
  success?: string
  newsletter?: Newsletter
  template?: Template
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  switch (req.method) {
    case "GET": {
      return await handleGetNewsletter({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}

async function handleGetNewsletter({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<Response>
}) {
  const newsletterId = req.query.newsletterId
  if (typeof newsletterId !== "string") {
    return res.status(400).json({ error: "Invalid newsletter id" })
  }

  const newsletter = await getNewsletter({ id: newsletterId })
  if (newsletter instanceof Error) {
    return res.status(400).json({ error: newsletter.message })
  }
  if (newsletter === null) {
    return res.status(400).json({ error: "No newsletter with provided id" })
  }

  const template = await getTemplate({ id: newsletter.templateId })
  if (template instanceof Error) {
    return res.status(400).json({ error: template.message })
  }
  if (template === null) {
    return res.status(400).json({ error: "No template with provided id" })
  }

  return res.status(200).json({ success: "Ok", newsletter, template })
}
