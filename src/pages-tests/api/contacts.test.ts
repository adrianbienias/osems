import apiContactsHandler from "@/pages/api/v1/contacts/"
import { describe, expect, test, vi } from "vitest"
import { mockRequestResponse } from "../../../mocks/api-mocks"

vi.mock("@/modules/contacts", () => {
  const mockedContacts = [
    { email: "foo-1@bar.baz" },
    { email: "foo-2@bar.baz" },
  ]

  return {
    filterContacts: vi.fn().mockResolvedValue(mockedContacts),
  }
})

describe("GET /api/contacts", () => {
  test("should return contacts array", async () => {
    const { req, res } = mockRequestResponse({ method: "GET" })

    await apiContactsHandler(req, res)

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      contacts: expect.any(Array),
    })
    expect(res._getJSONData().contacts.length).toStrictEqual(2)
    expect(res._getStatusCode()).toStrictEqual(200)
  })
})
