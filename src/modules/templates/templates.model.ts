import { prisma } from "@/libs/prisma"

export type { Template } from "@prisma/client"

export async function addTemplate({
  subject,
  preheader,
  markdown,
}: {
  subject: string
  preheader: string
  markdown: string
}) {
  return await prisma.template.create({
    data: { subject, preheader, markdown },
  })
}

export async function getTemplates() {
  return await prisma.template.findMany({ orderBy: { createdAt: "desc" } })
}

export async function updateTemplate({
  id,
  subject,
  preheader,
  markdown,
}: {
  id?: string
  subject?: string
  preheader?: string
  markdown?: string
}) {
  return await prisma.template.update({
    where: { id },
    data: { subject, preheader, markdown },
  })
}

export async function getTemplate({ id }: { id: string }) {
  return await prisma.template.findUnique({ where: { id } })
}
