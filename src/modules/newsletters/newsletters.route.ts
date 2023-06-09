import type { ApiResponse } from "@/libs/types"
import type { List } from "@/modules/lists"
import { getListWithContacts, getListsByIds } from "@/modules/lists"
import type { Template } from "@/modules/templates"
import { getTemplate } from "@/modules/templates"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Newsletter, NewsletterWithTemplate } from "./newsletters.model"
import {
  getNewsletter,
  getNewsletters,
  scheduleNewsletter,
} from "./newsletters.model"

export async function handlePostNewsletter({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse & { newsletter?: Newsletter }>
}) {
  let { subject, html, listId, listIdsToExclude, toSendAfter } = req.body as {
    subject?: string
    html?: string
    listId?: string
    listIdsToExclude?: string[]
    toSendAfter?: string
  }

  if (!listId) {
    return res.status(400).json({ error: "Missing list to send to" })
  }
  if (typeof listIdsToExclude === "string") {
    return res
      .status(400)
      .json({ error: "List ids to exclude has to be an array" })
  }
  if (listIdsToExclude?.includes(listId)) {
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
    return res.status(400).json({ error: "Missing html content" })
  }
  if (!html?.includes("{{unsubscribe}}")) {
    return res
      .status(400)
      .json({ error: "Missing {{unsubscribe}} in html content" })
  }

  const list = await getListWithContacts({ id: listId })
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
      listId,
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

export async function handleGetNewsletters({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<
    ApiResponse & { newslettersWithTemplate?: NewsletterWithTemplate[] }
  >
}) {
  let listId = req.query.listId?.toString()
  if (listId === "undefined" || listId === "") {
    listId = undefined
  }

  const newsletters = await getNewsletters({ listId })
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

export async function handleGetNewsletter({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<
    ApiResponse & {
      newsletter?: Newsletter
      template?: Template
      excludedLists?: List[]
    }
  >
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

  const excludedLists = await getListsByIds(
    JSON.parse(newsletter.listIdsToExclude)
  )

  return res
    .status(200)
    .json({ success: "Ok", newsletter, template, excludedLists })
}
