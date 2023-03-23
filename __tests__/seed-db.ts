import { prisma } from "@/libs/prisma"
import { addTemplate } from "@/modules/templates"
import { faker } from "@faker-js/faker"
import testData from "./test-data.json"

async function seedContacts() {
  const { text, ...templateData } = testData.confirmationTemplate
  const confirmationTemplate = await addTemplate(templateData)
  if (confirmationTemplate instanceof Error) {
    throw new Error(confirmationTemplate.message)
  }

  const createdList = await prisma.list.create({
    data: { ...testData.list, confirmationTemplateId: confirmationTemplate.id },
  })

  let i = 0
  while (i < 1000) {
    i++

    await prisma.contact.create({
      data: {
        email: faker.internet.email(),
        listId: createdList.id,
        confirmedAt: new Date(),
      },
    })
  }
}
seedContacts()

export {}
