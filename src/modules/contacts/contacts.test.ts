import { filterContacts, getContactsToSend } from "@/modules/contacts"
import * as contactsModel from "@/modules/contacts/contacts.model"
import { getContacts } from "@/modules/contacts/contacts.model"
import { copyFileSync } from "fs"
import { describe, expect, test, vi } from "vitest"

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
      listIdToInclude: "list-id-to-include-1",
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
    copyFileSync("./prisma/seeded-db.sqlite", "./prisma/test-db.sqlite")

    const expectedNumberOfFilteredAutoresponders = 25

    const contacts = await filterContacts({
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

describe("getContacts()", () => {
  test("should get contacts from database", async () => {
    copyFileSync("./prisma/seeded-db.sqlite", "./prisma/test-db.sqlite")

    const contacts = await getContacts({
      listId: "2e4b0581-0bdc-4a54-bc05-8877b8808a40",
    })
    if (contacts instanceof Error) {
      return expect(contacts).not.toBeInstanceOf(Error)
    }
    const expectedNumberOfContacts = 21

    expect(contacts.length).toStrictEqual(expectedNumberOfContacts)
  })
})
