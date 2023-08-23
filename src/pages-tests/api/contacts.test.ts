import { describe, expect, test, vi } from "vitest"
import { handleGetContacts } from "@/modules/contacts"
import apiContactsHandler from "@/pages/api/v1/contacts"
import { mockRequestResponse } from "../../../mocks/api-mocks"

vi.mock("@/modules/contacts", () => ({ handleGetContacts: vi.fn() }))

describe("GET /api/v1/contacts", () => {
  test("should call handleGetContacts()", async () => {
    const { req, res } = mockRequestResponse({ method: "GET" })
    await apiContactsHandler(req, res)
    expect(handleGetContacts).toHaveBeenCalledWith({ req, res })
  })
})
