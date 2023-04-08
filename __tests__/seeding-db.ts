import { prisma } from "@/libs/prisma"
import { addTemplate } from "@/modules/templates"
import { faker } from "@faker-js/faker"
import testData from "./test-data.json"

export async function seedContacts({
  listId,
  numberOfContacts,
}: {
  listId: string
  numberOfContacts: number
}) {
  const contacts = []
  for (let i = 0; i < numberOfContacts; i++) {
    const contact = await prisma.contact.create({
      data: {
        email: faker.internet.email(),
        listId,
        confirmedAt:
          Number(faker.random.numeric()) > 2 ? new Date() : undefined,
        unsubscribedAt:
          Number(faker.random.numeric()) > 8 ? new Date() : undefined,
      },
    })
    contacts.push(contact)
  }

  return contacts
}

export async function seedList() {
  let listName = `${faker.word.adjective()} ${faker.word.noun()}`
  listName = `${listName[0].toLocaleUpperCase()}${listName.slice(1)}`

  const { text, ...templateData } = testData.confirmationTemplate
  const confirmationTemplate = await addTemplate(templateData)
  if (confirmationTemplate instanceof Error) {
    throw new Error(confirmationTemplate.message)
  }

  const list = await prisma.list.create({
    data: {
      ...testData.list,
      name: listName,
      confirmationTemplateId: confirmationTemplate.id,
    },
  })

  return list
}

export async function seedListsWithContacts({
  numberOfLists,
  maxContacts,
}: {
  numberOfLists: number
  maxContacts: number
}) {
  const seededData = []
  for (let i = 0; i < numberOfLists; i++) {
    const { name: listName, id: listId } = await seedList()
    const numberOfContacts = Math.ceil(Math.random() * maxContacts)
    const contacts = await seedContacts({ listId, numberOfContacts })

    seededData.push({ listId, listName, contacts })
  }

  console.info(
    "Database seeding completed",
    seededData.map((data) => {
      const { contacts, ...rest } = data
      return { ...rest, numberOfContacts: contacts.length }
    })
  )

  return seededData
}
