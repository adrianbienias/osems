import { prisma } from "@/libs/prisma"
import { addTemplate } from "@/modules/templates"
import { faker } from "@faker-js/faker"
import { copyFileSync } from "fs"
import testData from "./test-data.json"

export function cleanTestDatabase() {
  copyFileSync("./prisma/empty-db.sqlite", "./prisma/test-db.sqlite")
}

export function seedTestDatabase() {
  copyFileSync("./prisma/seeded-db.sqlite", "./prisma/test-db.sqlite")
}

export async function seedDb(destDbFilename: string) {
  copyFileSync("./prisma/empty-db.sqlite", `./prisma/${destDbFilename}`)

  await seedListsWithContactsAndAutoresponders({
    numberOfLists: 5,
    maxContactsPerList: 200,
    maxAutorespondersPerList: 25,
  })
}

const createdAtConfig = {
  years: 1.5,
  refDate: "2001-01-01T00:00:00.000Z",
}

async function seedContacts({
  listId,
  numberOfContacts,
}: {
  listId: string
  numberOfContacts: number
}) {
  const contacts = []
  for (let i = 0; i < numberOfContacts; i++) {
    const createdAt = faker.date.past(createdAtConfig)
    const contact = await prisma.contact.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        listId,
        createdAt,
        confirmedAt:
          faker.number.int(100) < 80
            ? faker.date.soon({ days: 2, refDate: createdAt })
            : undefined,
        unsubscribedAt:
          faker.number.int(100) < 20
            ? faker.date.soon({ days: 365, refDate: createdAt })
            : undefined,
      },
    })
    contacts.push(contact)
  }

  return contacts
}

async function seedList() {
  let listName = faker.word.words({ count: { min: 1, max: 10 } })
  listName = `${listName[0].toUpperCase()}${listName.slice(1)}`

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
      createdAt: faker.date.past(createdAtConfig),
    },
  })

  return list
}

async function seedListsWithContactsAndAutoresponders({
  numberOfLists,
  maxContactsPerList,
  maxAutorespondersPerList,
}: {
  numberOfLists: number
  maxContactsPerList: number
  maxAutorespondersPerList: number
}) {
  const seededData = []
  for (let i = 0; i < numberOfLists; i++) {
    const { name: listName, id: listId } = await seedList()
    const numberOfContacts = Math.ceil(Math.random() * maxContactsPerList)
    const contacts = await seedContacts({ listId, numberOfContacts })
    const numberOfAutoresponders = Math.ceil(
      Math.random() * maxAutorespondersPerList
    )
    const autoresponders = await seedAutoresponders({
      listId,
      numberOfAutoresponders,
    })

    seededData.push({ listId, listName, contacts, autoresponders })
  }

  return seededData
}

async function seedAutoresponders({
  listId,
  numberOfAutoresponders,
  maxDelayDays = 30,
}: {
  listId: string
  numberOfAutoresponders: number
  maxDelayDays?: number
}) {
  const autoresponders = []
  for (let i = 0; i < numberOfAutoresponders; i++) {
    const { text, ...templateData } = testData.autoresponderTemplate
    const autoresponderTemplate = await addTemplate(templateData)
    if (autoresponderTemplate instanceof Error) {
      throw new Error(autoresponderTemplate.message)
    }

    const autoresponder = await prisma.autoresponder.create({
      data: {
        delayDays: faker.number.int(maxDelayDays),
        listId,
        templateId: autoresponderTemplate.id,
        createdAt: faker.date.past(createdAtConfig),
      },
    })
    autoresponders.push(autoresponder)
  }

  return autoresponders
}
