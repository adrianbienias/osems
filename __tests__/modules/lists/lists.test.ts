import { prisma } from "@/libs/prisma"
import { addContact } from "@/modules/contacts/contacts.model"
import { addList, getList, getLists, updateList } from "@/modules/lists"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { cleanDatabase } from "../../before-each"
import testData from "../../test-data.json"

const uuidRegex = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/

vi.mock("@/modules/templates", () => ({
  getTemplate: vi.fn(),
}))

beforeEach(async () => {
  await cleanDatabase()
})

describe("addList()", () => {
  test("should create a new list", async () => {
    expect(await prisma.list.findUnique({ where: { id: "1" } })).toStrictEqual(
      null
    )

    const addedList = await addList(testData.list)

    if (addedList instanceof Error) {
      return expect(addedList).not.toBeInstanceOf(Error)
    }

    expect(
      await prisma.list.findUnique({
        where: { id: addedList.id },
      })
    ).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      name: "Foo Bar List",
      from: "Foo Bar <foo@bar.baz>",
      confirmationTemplateId: "dummy-confirmation-template-id",
      signupRedirectUrl: "http://example.com/redirect/signup",
      confirmationRedirectUrl: "http://example.com/redirect/confirmation",
      unsubscribeRedirectUrl: "http://example.com/redirect/unsubscribe",
      createdAt: expect.any(Date),
    })
  })

  test("should reject creating list with the same name", async () => {
    expect(await addList(testData.list)).toStrictEqual({
      ...testData.list,
      id: expect.stringMatching(uuidRegex),
      createdAt: expect.any(Date),
    })

    expect(await addList(testData.list)).toStrictEqual(
      Error("List with provided name already exists")
    )
  })
})

describe("updateList()", () => {
  test("should update an existing list", async () => {
    const addedList = await addList(testData.list)
    if (addedList instanceof Error) {
      return expect(addedList).not.toBeInstanceOf(Error)
    }

    const initialList = {
      id: expect.stringMatching(uuidRegex),
      name: "Foo Bar List",
      from: "Foo Bar <foo@bar.baz>",
      confirmationTemplateId: "dummy-confirmation-template-id",
      signupRedirectUrl: "http://example.com/redirect/signup",
      confirmationRedirectUrl: "http://example.com/redirect/confirmation",
      unsubscribeRedirectUrl: "http://example.com/redirect/unsubscribe",
      createdAt: expect.any(Date),
    }

    expect(
      await prisma.list.findUnique({ where: { id: addedList.id } })
    ).toStrictEqual(initialList)

    await updateList({ id: addedList.id, name: "Foo Foo List" })

    expect(
      await prisma.list.findUnique({ where: { id: addedList.id } })
    ).toStrictEqual({ ...initialList, name: "Foo Foo List" })

    await updateList({ id: addedList.id, from: "Foo Foo <foo@foo.bar>" })

    expect(
      await prisma.list.findUnique({ where: { id: addedList.id } })
    ).toStrictEqual({
      ...initialList,
      name: "Foo Foo List",
      from: "Foo Foo <foo@foo.bar>",
    })

    await updateList({
      id: addedList.id,
      signupRedirectUrl: "Update value",
      confirmationRedirectUrl: "Update value",
      unsubscribeRedirectUrl: "Update value",
    })

    expect(
      await prisma.list.findUnique({ where: { id: addedList.id } })
    ).toStrictEqual({
      ...initialList,
      name: "Foo Foo List",
      from: "Foo Foo <foo@foo.bar>",
      signupRedirectUrl: "Update value",
      confirmationRedirectUrl: "Update value",
      unsubscribeRedirectUrl: "Update value",
    })
  })

  test("should reject creating list with the same name", async () => {
    expect(await addList(testData.list)).toStrictEqual({
      ...testData.list,
      id: expect.stringMatching(uuidRegex),
      createdAt: expect.any(Date),
    })

    expect(await addList(testData.list)).toStrictEqual(
      Error("List with provided name already exists")
    )
  })
})

describe("getLists()", () => {
  test("should return empty array if there are no lists", async () => {
    expect(await getLists()).toStrictEqual([])
  })

  test("should return array of lists ordered descending by creation including contacts count", async () => {
    const list = await addList(testData.list)
    if (list instanceof Error) {
      return expect(list).not.toBeInstanceOf(Error)
    }
    await addContact({ email: "foo@bar.baz", listId: list.id })
    await addList({ ...testData.list, name: "Foo Bar List #2" })

    expect(await getLists()).toStrictEqual([
      {
        ...testData.list,
        id: expect.stringMatching(uuidRegex),
        name: "Foo Bar List #2",
        createdAt: expect.any(Date),
        _count: { contacts: 0 },
      },
      {
        ...testData.list,
        id: expect.stringMatching(uuidRegex),
        createdAt: expect.any(Date),
        _count: { contacts: 1 },
      },
    ])
  })
})

describe("getList()", () => {
  test("should get a list", async () => {
    const addedList = await addList(testData.list)
    if (addedList instanceof Error) {
      return expect(addedList).not.toBeInstanceOf(Error)
    }

    expect(await getList({ id: addedList.id })).toStrictEqual({
      ...testData.list,
      id: expect.stringMatching(uuidRegex),
      createdAt: expect.any(Date),
      contacts: [],
    })
  })
})
