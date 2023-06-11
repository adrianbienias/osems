import { seedTestDatabase } from "mocks/seed-db"
import { describe, expect, test, vi } from "vitest"
import * as contactsModel from "./contacts.model"
import { filterContacts, getContacts } from "./contacts.model"
import { getContactsToSend } from "./contacts.service"

describe("getContactsToSend()", () => {
  test("should prepare contacts to send to, respecting exclusions", async () => {
    vi.spyOn(contactsModel, "getContacts").mockImplementation(
      vi.fn().mockImplementation(({ listId }) => {
        const mockedList1 = [
          { email: "foo-1@bar.baz", confirmedAt: new Date() },
          { email: "foo-2@bar.baz", confirmedAt: new Date() },
          { email: "foo-3@bar.baz", confirmedAt: new Date() },
          { email: "foo-4@bar.baz", confirmedAt: new Date() },
          { email: "foo-5@bar.baz", confirmedAt: new Date() },
          { email: "foo-6@bar.baz", confirmedAt: new Date() },
          { email: "foo-7@bar.baz", confirmedAt: new Date() },
        ]
        const mockedList2 = [
          { email: "foo-2@bar.baz", confirmedAt: new Date() },
          { email: "foo-3@bar.baz", confirmedAt: new Date() },
        ]
        const mockedList3 = [
          { email: "foo-5@bar.baz", confirmedAt: new Date() },
          { email: "foo-6@bar.baz", confirmedAt: new Date() },
        ]

        if (listId === "list-id-to-include-1") {
          return Promise.resolve(mockedList1)
        }
        if (listId === "list-id-to-exclude-2") {
          return Promise.resolve(mockedList2)
        }
        if (listId === "list-id-to-exclude-3") {
          return Promise.resolve(mockedList3)
        }
      })
    )

    const contactsToSend = await getContactsToSend({
      listId: "list-id-to-include-1",
      listIdsToExclude: ["list-id-to-exclude-2", "list-id-to-exclude-3"],
    })

    expect(contactsToSend).toStrictEqual([
      { email: "foo-1@bar.baz", confirmedAt: expect.any(Date) },
      { email: "foo-4@bar.baz", confirmedAt: expect.any(Date) },
      { email: "foo-7@bar.baz", confirmedAt: expect.any(Date) },
    ])

    vi.restoreAllMocks()
  })
})

describe("filterContacts()", async () => {
  test("should return a given number of contacts", async () => {
    seedTestDatabase()

    const expectedNumberOfFilteredAutoresponders = 25
    const contacts = await filterContacts({
      take: expectedNumberOfFilteredAutoresponders,
    })

    expect(contacts.length).toStrictEqual(
      expectedNumberOfFilteredAutoresponders
    )
  })
})

describe("getContacts()", () => {
  test("should get contacts from database", async () => {
    seedTestDatabase()

    const expectedNumberOfContacts = 21
    const contacts = await getContacts({
      listId: "2e4b0581-0bdc-4a54-bc05-8877b8808a40",
    })

    expect(contacts.length).toStrictEqual(expectedNumberOfContacts)
  })
})
