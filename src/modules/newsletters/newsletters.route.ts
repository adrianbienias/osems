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
  let { subject, preheader, markdown, listId, listIdsToExclude, toSendAfter } =
    req.body as {
      subject?: string
      preheader?: string
      markdown?: string
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
  if (typeof preheader !== "string") {
    return res.status(400).json({ error: "Invalid preheader" })
  }
  if (!markdown) {
    return res.status(400).json({ error: "Missing markdown content" })
  }
  if (!markdown?.includes("{{unsubscribe}}")) {
    return res
      .status(400)
      .json({ error: "Missing {{unsubscribe}} in markdown content" })
  }

  const list = await getListWithContacts({ id: listId })
  if (!list) {
    return res.status(400).json({ error: "List does not exists" })
  }
  if (list.contacts.length < 1) {
    return res.status(400).json({ error: "No contacts on the list" })
  }

  const newsletter = await scheduleNewsletter({
    newsletterTemplate: { subject, preheader, markdown },
    listId,
    listIdsToExclude: JSON.stringify(listIdsToExclude),
    toSendAfter: new Date(toSendAfter),
  })
  if (newsletter instanceof Error) {
    return res.status(400).json({ error: newsletter.message })
  }

  return res.status(200).json({ success: "Ok", newsletter })
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
  const newslettersWithTemplate: NewsletterWithTemplate[] = []
  for (const newsletter of newsletters) {
    const template = await getTemplate({ id: newsletter.templateId })
    if (!template) {
      continue
    }

    newslettersWithTemplate.push({ ...newsletter, template })
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
  if (!newsletter) {
    return res.status(400).json({ error: "No newsletter with provided id" })
  }

  const template = await getTemplate({ id: newsletter.templateId })
  if (!template) {
    return res.status(400).json({ error: "No template with provided id" })
  }

  const excludedLists = await getListsByIds(
    JSON.parse(newsletter.listIdsToExclude)
  )

  return res
    .status(200)
    .json({ success: "Ok", newsletter, template, excludedLists })
}
