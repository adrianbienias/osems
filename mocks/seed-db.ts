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
  await seedNewsletters({ maxNewslettersPerList: 10 })
}

const createdAtConfig = { years: 1.5, refDate: "2001-01-01T00:00:00.000Z" }

async function seedNewsletters({
  maxNewslettersPerList,
}: {
  maxNewslettersPerList: number
}) {
  const listIds = (await prisma.list.findMany()).map((list) => list.id)
  for (let j = 0; j < listIds.length; j++) {
    const listId = listIds[j]
    const listIdsToExclude = faker.helpers.arrayElements(
      listIds.filter((listIdToExclude) => listIdToExclude !== listId),
      { min: 0, max: listIds.length - 1 }
    )

    const numberOfNewsletters = Math.ceil(Math.random() * maxNewslettersPerList)
    for (let i = 0; i < numberOfNewsletters; i++) {
      const newsletterTemplate = await addTemplate(testData.newsletterTemplate)
      if (newsletterTemplate instanceof Error) {
        throw new Error(newsletterTemplate.message)
      }

      await prisma.newsletter.create({
        data: {
          listId,
          toSendAfter: faker.date.past(createdAtConfig),
          listIdsToExclude: JSON.stringify(listIdsToExclude),
          templateId: newsletterTemplate.id,
          createdAt: faker.date.past(createdAtConfig),
        },
      })
    }
  }
}

async function seedContacts({
  listId,
  numberOfContacts,
}: {
  listId: string
  numberOfContacts: number
}) {
  for (let i = 0; i < numberOfContacts; i++) {
    const createdAt = faker.date.past(createdAtConfig)

    await prisma.contact.create({
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
  }
}

async function seedList() {
  let listName = faker.word.words({ count: { min: 1, max: 10 } })
  listName = `${listName[0].toUpperCase()}${listName.slice(1)}`

  const confirmationTemplate = await addTemplate(testData.confirmationTemplate)
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
  for (let i = 0; i < numberOfLists; i++) {
    const { id: listId } = await seedList()

    const numberOfContacts = Math.ceil(Math.random() * maxContactsPerList)
    await seedContacts({ listId, numberOfContacts })

    const numberOfAutoresponders = Math.ceil(
      Math.random() * maxAutorespondersPerList
    )
    await seedAutoresponders({ listId, numberOfAutoresponders })
  }
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
  for (let i = 0; i < numberOfAutoresponders; i++) {
    const autoresponderTemplate = await addTemplate(
      testData.autoresponderTemplate
    )
    if (autoresponderTemplate instanceof Error) {
      throw new Error(autoresponderTemplate.message)
    }

    await prisma.autoresponder.create({
      data: {
        delayDays: faker.number.int(maxDelayDays),
        listId,
        templateId: autoresponderTemplate.id,
        createdAt: faker.date.past(createdAtConfig),
      },
    })
  }
}
