import type { ApiResponse } from "@/libs/types"
import type { Template } from "@/modules/templates"
import { addTemplate, getTemplate, updateTemplate } from "@/modules/templates"
import type { NextApiRequest, NextApiResponse } from "next"
import type { List } from "./lists.model"
import { addList, getList, getLists, updateList } from "./lists.model"

export async function handlePostList({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse & { list?: List }>
}) {
  let {
    name,
    subject,
    preheader,
    markdown,
    signupRedirectUrl,
    confirmationRedirectUrl,
    unsubscribeRedirectUrl,
  } = req.body as {
    name?: string
    subject?: string
    preheader?: string
    markdown?: string
    signupRedirectUrl?: string
    confirmationRedirectUrl?: string
    unsubscribeRedirectUrl?: string
  }

  if (!name) {
    return res.status(400).json({ error: "Missing list name" })
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
  if (typeof preheader !== "string") {
    return res.status(400).json({ error: "Invalid preheader" })
  }
  if (!markdown) {
    return res.status(400).json({ error: "Missing email template" })
  }
  if (!markdown.includes("{{confirmation}}")) {
    return res
      .status(400)
      .json({ error: "Missing {{confirmation}} in email template" })
  }

  const confirmationTemplate = await addTemplate({
    subject,
    preheader,
    markdown,
  })
  if (confirmationTemplate instanceof Error) {
    return res.status(400).json({ error: confirmationTemplate.message })
  }

  const confirmationTemplateId = confirmationTemplate.id
  const list = await addList({
    name,
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

export async function handleGetLists({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse & { lists?: List[] }>
}) {
  const lists = await getLists()

  return res.status(200).json({ success: "Ok", lists })
}

export async function handleGetList({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<
    ApiResponse & { list?: List; confirmationTemplate?: Template }
  >
}) {
  const listId = req.query.listId

  if (typeof listId !== "string") {
    return res.status(400).json({ error: "Invalid list id" })
  }

  const list = await getList({ id: listId })
  if (!list) {
    return res.status(400).json({ error: "No list with provided id" })
  }

  const confirmationTemplate = await getTemplate({
    id: list.confirmationTemplateId,
  })
  if (!confirmationTemplate) {
    return res.status(400).json({ error: "Missing confirmation template" })
  }

  return res.status(200).json({ success: "Ok", list, confirmationTemplate })
}

export async function handlePatchList({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<ApiResponse & { list?: List }>
}) {
  let {
    name,
    subject,
    preheader,
    markdown,
    signupRedirectUrl,
    confirmationRedirectUrl,
    unsubscribeRedirectUrl,
  } = req.body as {
    name?: string
    subject?: string
    preheader?: string
    markdown?: string
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
  if (typeof preheader !== "string") {
    return res.status(400).json({ error: "Invalid preheader" })
  }
  if (markdown === "") {
    return res.status(400).json({ error: "Missing email template" })
  }
  if (!markdown?.includes("{{confirmation}}")) {
    return res
      .status(400)
      .json({ error: "Missing {{confirmation}} in email template" })
  }

  const list = await getList({ id: listId })
  if (!list) {
    return Error("Invalid list id")
  }

  const template = await updateTemplate({
    id: list.confirmationTemplateId,
    subject,
    preheader,
    markdown,
  })
  if (template instanceof Error) {
    return res.status(400).json({ error: template.message })
  }

  const updatedList = await updateList({
    id: listId,
    name,
    signupRedirectUrl,
    confirmationRedirectUrl,
    unsubscribeRedirectUrl,
  })
  if (updatedList instanceof Error) {
    return res.status(400).json({ error: updatedList.message })
  }

  return res.status(200).json({ success: "List updated", list: updatedList })
}
