import { prisma } from "@/libs/prisma"
import { HtmlValidate } from "html-validate"
import { convertTemplateHtmlToText } from "./templates.service"

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

  try {
    return await prisma.template.create({ data: { subject, html, text } })
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}

export async function getTemplates() {
  try {
    return await prisma.template.findMany({ orderBy: { createdAt: "desc" } })
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
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

  try {
    return await prisma.template.update({
      where: { id },
      data: { subject, html, text },
    })
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}

export async function getTemplate({ id }: { id: string }) {
  try {
    return await prisma.template.findUnique({ where: { id } })
  } catch (error) {
    console.error(error)

    return Error("Internal Server Error")
  }
}
