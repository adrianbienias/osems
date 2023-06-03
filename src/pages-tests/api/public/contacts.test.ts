import { contactsGetHandler, contactsPostHandler } from "@/modules/contacts"
import apiContactsHandler from "@/pages/api/v1/public/contacts"
import { describe, expect, test, vi } from "vitest"
import { mockRequestResponse } from "../../../../mocks/api-mocks"

vi.mock("@/modules/contacts", () => ({
  contactsGetHandler: vi.fn(),
  contactsPostHandler: vi.fn(),
}))

describe("GET /api/v1/public/contacts", () => {
  test("should call contactsGetHandler()", async () => {
    const { req, res } = mockRequestResponse({ method: "GET" })
    await apiContactsHandler(req, res)
    expect(contactsGetHandler).toHaveBeenCalledWith({ req, res })
  })
})

describe("POST /api/v1/public/contacts", () => {
  test("should call contactsPostHandler()", async () => {
    const { req, res } = mockRequestResponse({
      method: "POST",
      body: { foo: "bar" },
    })
    await apiContactsHandler(req, res)
    expect(contactsPostHandler).toHaveBeenCalledWith({ req, res })
  })
})
