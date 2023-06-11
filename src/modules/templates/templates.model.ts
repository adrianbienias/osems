import { prisma } from "@/libs/prisma"
import { HtmlValidate } from "html-validate"
import { convertTemplateHtmlToText } from "./templates.service"

export type { Template } from "@prisma/client"

export async function addTemplate({
  subject,
  html,
}: {
  subject: string
  html: string
}) {
  const htmlValidator = new HtmlValidate()
  const htmlValidation = htmlValidator.validateString(html)

  if (!htmlValidation.valid) {
    return Error("Invalid HTML markup in email template")
  }

  const text = convertTemplateHtmlToText(html)

  return await prisma.template.create({ data: { subject, html, text } })
}

export async function getTemplates() {
  return await prisma.template.findMany({ orderBy: { createdAt: "desc" } })
}

export async function updateTemplate({
  id,
  subject,
  html,
}: {
  id: string
  subject?: string
  html?: string
}) {
  let text

  if (html) {
    const htmlValidator = new HtmlValidate()
    const htmlValidation = htmlValidator.validateString(html)

    if (!htmlValidation.valid) {
      return Error("Invalid HTML markup in email template")
    }

    text = convertTemplateHtmlToText(html)
  }

  return await prisma.template.update({
    where: { id },
    data: { subject, html, text },
  })
}

export async function getTemplate({ id }: { id: string }) {
  return await prisma.template.findUnique({ where: { id } })
}
