import { prisma } from "@/libs/prisma"

export type { Template } from "@prisma/client"

export async function addTemplate({
  subject,
  markdown,
}: {
  subject: string
  markdown: string
}) {
  return await prisma.template.create({ data: { subject, markdown } })
}

export async function getTemplates() {
  return await prisma.template.findMany({ orderBy: { createdAt: "desc" } })
}

export async function updateTemplate({
  id,
  subject,
  markdown,
}: {
  id: string
  subject?: string
  markdown?: string
}) {
  return await prisma.template.update({
    where: { id },
    data: { subject, markdown },
  })
}

export async function getTemplate({ id }: { id: string }) {
  return await prisma.template.findUnique({ where: { id } })
}
