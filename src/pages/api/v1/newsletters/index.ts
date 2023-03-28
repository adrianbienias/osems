import { ApiResponse, NewsletterWithTemplate } from "@/libs/types"
import { getList } from "@/modules/lists"
import { getNewsletters, scheduleNewsletter } from "@/modules/newsletters"
import { getTemplate } from "@/modules/templates"
import { Newsletter } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "POST": {
      return await handleScheduleNewsletter({ req, res })
    }
    case "GET": {
      return await handleGetNewsletters({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}

async function handleScheduleNewsletter({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse & { newsletter?: Newsletter }>
}) {
  let { subject, html, listIdToInclude, listIdsToExclude, toSendAfter } =
    req.body as {
      subject?: string
      html?: string
      listIdToInclude?: string
      listIdsToExclude?: string[]
      toSendAfter?: string
    }

  if (!listIdToInclude) {
    return res.status(400).json({ error: "Missing list to send to" })
  }
  if (typeof listIdsToExclude === "string") {
    return res
      .status(400)
      .json({ error: "List ids to exclude has to be an array" })
  }
  if (listIdsToExclude?.includes(listIdToInclude)) {
    return res
      .status(400)
      .json({ error: "Cannot exclude a list that is selected as to send" })
  }
  if (!toSendAfter) {
    return res.status(400).json({ error: "Missing scheduled date" })
  }
  if (!subject) {
    return res.status(400).json({ error: "Missing subject" })
  }
  if (!html) {
    return res.status(400).json({ error: "Missing email template" })
  }
  if (!html?.includes("{{unsubscribe}}")) {
    return res
      .status(400)
      .json({ error: "Missing {{unsubscribe}} in email template" })
  }

  const list = await getList({ id: listIdToInclude })
  if (list instanceof Error) {
    return res.status(400).json({ error: list.message })
  }
  if (!list) {
    return res.status(400).json({ error: "List does not exists" })
  }
  if (list.contacts.length < 1) {
    return res.status(400).json({ error: "No contacts on the list" })
  }

  try {
    const newsletter = await scheduleNewsletter({
      newsletterTemplate: { subject, html },
      listIdToInclude,
      listIdsToExclude: JSON.stringify(listIdsToExclude),
      toSendAfter: new Date(toSendAfter),
    })

    if (newsletter instanceof Error) {
      return res.status(400).json({ error: newsletter.message })
    }

    return res.status(200).json({ success: "Ok", newsletter })
  } catch (error) {
    console.error(error)

    return res.status(500).json({ error: "Internal server error" })
  }
}

async function handleGetNewsletters({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<
    ApiResponse & { newslettersWithTemplate?: NewsletterWithTemplate[] }
  >
}) {
  const newsletters = await getNewsletters()
  if (newsletters instanceof Error) {
    return res.status(400).json({ error: newsletters.message })
  }

  const newslettersWithTemplate: NewsletterWithTemplate[] = []
  for (const newsletter of newsletters) {
    const template = await getTemplate({ id: newsletter.templateId })
    if (template instanceof Error) {
      return res.status(400).json({ error: template.message })
    }
    if (template) {
      newslettersWithTemplate.push({ ...newsletter, template })
    }
  }

  return res.status(200).json({ success: "Ok", newslettersWithTemplate })
}
