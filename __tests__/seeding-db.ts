import { prisma } from "@/libs/prisma"
import { addTemplate } from "@/modules/templates"
import { faker } from "@faker-js/faker"
import testData from "./test-data.json"

async function seedContacts({
  listName,
  numberOfContacts,
}: {
  listName: string
  numberOfContacts: number
}) {
  const { text, ...templateData } = testData.confirmationTemplate
  const confirmationTemplate = await addTemplate(templateData)
  if (confirmationTemplate instanceof Error) {
    throw new Error(confirmationTemplate.message)
  }

  const createdList = await prisma.list.create({
    data: {
      ...testData.list,
      name: listName,
      confirmationTemplateId: confirmationTemplate.id,
    },
  })

  for (let i = 0; i < numberOfContacts; i++) {
    await prisma.contact.create({
      data: {
        email: faker.internet.email(),
        listId: createdList.id,
        confirmedAt:
          Number(faker.random.numeric()) > 2 ? new Date() : undefined,
        unsubscribedAt:
          Number(faker.random.numeric()) > 8 ? new Date() : undefined,
      },
    })
  }
}

export async function seedListsWithContacts({
  numberOfLists,
  maxContactsPerList,
}: {
  numberOfLists: number
  maxContactsPerList: number
}) {
  const seededData = []
  for (let i = 0; i < numberOfLists; i++) {
    let listName = `${faker.word.adjective()} ${faker.word.noun()}`
    listName = `${listName[0].toLocaleUpperCase()}${listName.slice(1)}`
    const numberOfContacts = Math.ceil(Math.random() * maxContactsPerList)

    await seedContacts({ listName, numberOfContacts })
    seededData.push({ listName, numberOfContacts })
  }

  console.info("Database seeding completed", seededData)

  return seededData
}
