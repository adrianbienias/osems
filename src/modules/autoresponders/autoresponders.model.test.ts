import { uuidRegex } from "@/libs/validators"
import { cleanTestDatabase, seedTestDatabase } from "mocks/seed-db"
import { beforeEach, describe, expect, test } from "vitest"
import {
  addAutoresponder,
  filterAutoresponders,
  getAutoresponder,
  getAutoresponders,
  updateAutoresponder,
} from "./autoresponders.model"

beforeEach(() => {
  cleanTestDatabase()
})

describe("addAutoresponder()", () => {
  test("should add autoresponder to database", async () => {
    seedTestDatabase()

    const listId = "2e4b0581-0bdc-4a54-bc05-8877b8808a40"
    const delayDays = 9

    const autoresponder = await addAutoresponder({
      autoresponderTemplate: {
        html: "<p>Autoresponder dummy content</p>",
        subject: "Autoresponder dummy subject",
      },
      delayDays,
      listId,
    })
    if (autoresponder instanceof Error) {
      return expect(autoresponder).not.toBeInstanceOf(Error)
    }

    expect(await getAutoresponder({ id: autoresponder.id })).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      listId,
      templateId: expect.stringMatching(uuidRegex),
      delayDays,
      createdAt: expect.any(Date),
    })
  })
})

describe("filterAutoresponders()", async () => {
  test("should return a given number of autoresponders", async () => {
    expect(await filterAutoresponders({})).toStrictEqual([])

    seedTestDatabase()

    const expectedNumberOfFilteredAutoresponders = 7
    const contacts = await filterAutoresponders({
      take: expectedNumberOfFilteredAutoresponders,
    })

    expect(contacts.length).toStrictEqual(
      expectedNumberOfFilteredAutoresponders
    )
  })
})

describe("getAutoresponder()", async () => {
  test("should return an autoresponder", async () => {
    seedTestDatabase()

    const listId = "2e4b0581-0bdc-4a54-bc05-8877b8808a40"
    const delayDays = 4

    const autoresponder = await addAutoresponder({
      autoresponderTemplate: {
        html: "<p>Autoresponder dummy content</p>",
        subject: "Autoresponder dummy subject",
      },
      delayDays,
      listId,
    })
    if (autoresponder instanceof Error) {
      return expect(autoresponder).not.toBeInstanceOf(Error)
    }

    expect(await getAutoresponder({ id: autoresponder.id })).toStrictEqual({
      createdAt: expect.any(Date),
      delayDays,
      id: autoresponder.id,
      listId: expect.stringMatching(uuidRegex),
      templateId: expect.stringMatching(uuidRegex),
    })
  })
})

describe("getAutoresponders()", async () => {
  test("should return all autoresponders", async () => {
    seedTestDatabase()

    const expectedNumberOfAutoresponders = 82

    const autoresponders = await getAutoresponders()

    expect(autoresponders.length).toStrictEqual(expectedNumberOfAutoresponders)

    autoresponders.forEach((autoresponder) => {
      expect(autoresponder).toStrictEqual({
        createdAt: expect.any(Date),
        delayDays: expect.any(Number),
        id: expect.stringMatching(uuidRegex),
        listId: expect.stringMatching(uuidRegex),
        templateId: expect.stringMatching(uuidRegex),
      })
    })
  })
})

describe("updateAutoresponder()", async () => {
  test("should update autoresponder", async () => {
    seedTestDatabase()

    const autoresponderId = "a77344bb-ba25-4112-8402-32b932b5b0d6"
    const expectedDelayDays = 369
    const expectedListId = "2e4b0581-0bdc-4a54-bc05-8877b8808a40"

    const updatedListId = "048df004-02a0-4b26-b77a-0d6f713fac4c"
    const updatedDelayDays = 0

    const autoresponder = await getAutoresponder({ id: autoresponderId })
    if (!autoresponder) {
      return expect(autoresponder).not.toBeNull()
    }

    expect(autoresponder.delayDays).toStrictEqual(expectedDelayDays)
    expect(autoresponder.listId).toStrictEqual(expectedListId)

    await updateAutoresponder({
      id: autoresponderId,
      listId: updatedListId,
      delayDays: updatedDelayDays,
    })

    const updatedAutoresponder = await getAutoresponder({ id: autoresponderId })
    expect(updatedAutoresponder).toStrictEqual({
      createdAt: expect.any(Date),
      delayDays: updatedDelayDays,
      id: autoresponderId,
      listId: updatedListId,
      templateId: expect.stringMatching(uuidRegex),
    })
  })
})
