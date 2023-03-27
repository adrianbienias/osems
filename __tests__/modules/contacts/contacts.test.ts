import {
  getContactsToExclude,
  getContactsToSend,
} from "@/modules/contacts/contacts.service"
import { getList } from "@/modules/lists"
import { describe, expect, test, vi } from "vitest"

vi.mock("@/modules/lists/lists.model", () => {
  const mockedListWithContactsToInclude = {
    contacts: [
      { email: "foo-1@bar.baz", confirmedAt: new Date() },
      { email: "foo-2@bar.baz", confirmedAt: new Date() },
      { email: "foo-3@bar.baz", confirmedAt: new Date() },
      { email: "foo-4@bar.baz", confirmedAt: new Date() },
    ],
  }
  const mockedListWithContactsToExclude = {
    contacts: [
      { email: "foo-2@bar.baz", confirmedAt: new Date() },
      { email: "foo-3@bar.baz", confirmedAt: new Date() },
    ],
  }

  return {
    getList: vi.fn().mockImplementation(({ id }) => {
      if (id === "list-id-to-include") {
        return Promise.resolve(mockedListWithContactsToInclude)
      }
      if (id === "list-id-to-exclude") {
        return Promise.resolve(mockedListWithContactsToExclude)
      }
    }),
  }
})

describe("getContactsToExclude()", () => {
  test("should exclude provided contacts along with globally excluded", async () => {
    const contactsToExclude = await getContactsToExclude({
      listIdsToExclude: ["list-id-to-exclude"],
    })

    expect(getList).toHaveBeenCalledWith({ id: "list-id-to-exclude" })
    expect(contactsToExclude).toStrictEqual([
      { email: "foo-2@bar.baz" },
      { email: "foo-3@bar.baz" },
    ])
  })
})

describe("getContactsToSend()", () => {
  test("should get only active and not contacts", async () => {
    const contactsToSend = getContactsToSend({
      contactsToInclude: [
        {
          email: "foo-1@bar.baz",
          listId: "x",
          confirmedAt: null,
          unsubscribedAt: null,
          createdAt: new Date(),
        },
        {
          email: "foo-2@bar.baz",
          listId: "x",
          confirmedAt: new Date(),
          unsubscribedAt: null,
          createdAt: new Date(),
        },
        {
          email: "foo-3@bar.baz",
          listId: "x",
          confirmedAt: new Date(),
          unsubscribedAt: new Date(),
          createdAt: new Date(),
        },
        {
          email: "foo-4@bar.baz",
          listId: "x",
          confirmedAt: new Date(),
          unsubscribedAt: null,
          createdAt: new Date(),
        },
      ],
      contactsToExclude: [{ email: "foo-4@bar.baz" }],
    })

    expect(contactsToSend).toStrictEqual([
      {
        confirmedAt: expect.any(Date),
        createdAt: expect.any(Date),
        email: "foo-2@bar.baz",
        listId: "x",
        unsubscribedAt: null,
      },
    ])
  })
})
