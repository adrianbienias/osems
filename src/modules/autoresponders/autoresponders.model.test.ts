import { prisma } from "@/libs/prisma"
import { uuidRegex } from "@/libs/validators"
import {
  addAutoresponder,
  filterAutoresponders,
  getAutoresponder,
  getAutoresponders,
  updateAutoresponder,
} from "@/modules/autoresponders/autoresponders.model"
import { copyFileSync } from "fs"
import { beforeEach, describe, expect, test } from "vitest"
import testData from "../../../mocks/test-data.json"

beforeEach(() => {
  copyFileSync("./prisma/empty-db.sqlite", "./prisma/test-db.sqlite")
})

describe("addAutoresponder()", () => {
  test("should add autoresponder to database", async () => {
    expect(await prisma.autoresponder.findMany()).toStrictEqual([])

    const list = await prisma.list.create({ data: testData.list })

    await addAutoresponder({
      autoresponderTemplate: {
        html: "<p>Autoresponder dummy content</p>",
        subject: "Autoresponder dummy subject",
      },
      delayDays: 0,
      listId: list.id,
    })

    expect(await prisma.autoresponder.findMany()).toStrictEqual([
      {
        id: expect.stringMatching(uuidRegex),
        listId: expect.stringMatching(uuidRegex),
        templateId: expect.stringMatching(uuidRegex),
        delayDays: 0,
        createdAt: expect.any(Date),
      },
    ])
  })
})

describe("filterAutoresponders()", async () => {
  test("should return a given number of autoresponders", async () => {
    expect(await filterAutoresponders({})).toStrictEqual([])

    copyFileSync("./prisma/seeded-db.sqlite", "./prisma/test-db.sqlite")

    const expectedNumberOfFilteredAutoresponders = 7

    const contacts = await filterAutoresponders({
      take: expectedNumberOfFilteredAutoresponders,
    })
    if (contacts instanceof Error) {
      return expect(contacts).not.toBeInstanceOf(Error)
    }

    expect(contacts.length).toStrictEqual(
      expectedNumberOfFilteredAutoresponders
    )
  })
})

describe("getAutoresponder()", async () => {
  test("should return an autoresponder", async () => {
    const list = await prisma.list.create({ data: testData.list })
    const autoresponder = await addAutoresponder({
      autoresponderTemplate: {
        html: "<p>Autoresponder dummy content</p>",
        subject: "Autoresponder dummy subject",
      },
      delayDays: 0,
      listId: list.id,
    })
    if (autoresponder instanceof Error) {
      return expect(autoresponder).not.toBeInstanceOf(Error)
    }

    expect(await getAutoresponder({ id: autoresponder.id })).toStrictEqual({
      createdAt: expect.any(Date),
      delayDays: 0,
      id: autoresponder.id,
      listId: expect.stringMatching(uuidRegex),
      templateId: expect.stringMatching(uuidRegex),
    })
  })
})

describe("getAutoresponders()", async () => {
  test("should return all autoresponders", async () => {
    copyFileSync("./prisma/seeded-db.sqlite", "./prisma/test-db.sqlite")

    const expectedNumberOfAutoresponders = 82

    const autoresponders = await getAutoresponders()
    if (autoresponders instanceof Error) {
      return expect(autoresponders).not.toBeInstanceOf(Error)
    }

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
    const list1 = await prisma.list.create({
      data: { ...testData.list, name: "Foo Bar List #1" },
    })
    const list2 = await prisma.list.create({
      data: { ...testData.list, name: "Foo Bar List #2" },
    })
    const autoresponder = await addAutoresponder({
      autoresponderTemplate: {
        html: "<p>Autoresponder dummy content</p>",
        subject: "Autoresponder dummy subject",
      },
      delayDays: 0,
      listId: list1.id,
    })
    if (autoresponder instanceof Error) {
      return expect(autoresponder).not.toBeInstanceOf(Error)
    }

    await updateAutoresponder({
      id: autoresponder.id,
      delayDays: 8,
      listId: list2.id,
    })

    const updatedAutoresponder = await prisma.autoresponder.findUnique({
      where: { id: autoresponder.id },
    })

    expect(updatedAutoresponder).toStrictEqual({
      createdAt: expect.any(Date),
      delayDays: 8,
      id: autoresponder.id,
      listId: expect.stringMatching(uuidRegex),
      templateId: expect.stringMatching(uuidRegex),
    })
  })
})
