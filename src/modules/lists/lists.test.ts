import { cleanTestDatabase } from "mocks/seed-db"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { uuidRegex } from "@/libs/validators"
import { addContact } from "@/modules/contacts/contacts.model"
import testData from "../../../mocks/test-data.json"
import {
  addList,
  getAllLists,
  getList,
  getLists,
  updateList,
} from "./lists.model"

vi.mock("@/modules/templates", () => ({ getTemplate: vi.fn() }))

beforeEach(() => {
  cleanTestDatabase()
})

describe("addList()", () => {
  test("should create a new list", async () => {
    expect(await getAllLists()).toStrictEqual([])

    const addedList = await addList(testData.list)
    if (addedList instanceof Error) {
      return expect(addedList).not.toBeInstanceOf(Error)
    }

    expect(await getAllLists()).toStrictEqual([
      {
        id: expect.stringMatching(uuidRegex),
        name: "Foo Bar List",
        confirmationTemplateId: "dummy-confirmation-template-id",
        signupRedirectUrl: "http://example.com/redirect/signup",
        confirmationRedirectUrl: "http://example.com/redirect/confirmation",
        unsubscribeRedirectUrl: "http://example.com/redirect/unsubscribe",
        createdAt: expect.any(Date),
      },
    ])
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
      confirmationTemplateId: "dummy-confirmation-template-id",
      signupRedirectUrl: "http://example.com/redirect/signup",
      confirmationRedirectUrl: "http://example.com/redirect/confirmation",
      unsubscribeRedirectUrl: "http://example.com/redirect/unsubscribe",
      createdAt: expect.any(Date),
    }

    expect(await getList({ id: addedList.id })).toStrictEqual(initialList)

    await updateList({ id: addedList.id, name: "Foo Foo List" })
    expect(await getList({ id: addedList.id })).toStrictEqual({
      ...initialList,
      name: "Foo Foo List",
    })

    await updateList({ id: addedList.id })
    expect(await getList({ id: addedList.id })).toStrictEqual({
      ...initialList,
      name: "Foo Foo List",
    })

    await updateList({
      id: addedList.id,
      signupRedirectUrl: "Update value",
      confirmationRedirectUrl: "Update value",
      unsubscribeRedirectUrl: "Update value",
    })
    expect(await getList({ id: addedList.id })).toStrictEqual({
      ...initialList,
      name: "Foo Foo List",
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
    })
  })
})
