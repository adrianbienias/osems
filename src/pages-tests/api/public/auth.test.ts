import { describe, expect, test, vi } from "vitest"
import { handleDeleteAuth, handleGetAuth, handlePostAuth } from "@/modules/auth"
import apiAuthHandler from "@/pages/api/v1/public/auth"
import { mockRequestResponse } from "../../../../mocks/api-mocks"

vi.mock("@/modules/auth", () => ({
  handlePostAuth: vi.fn(),
  handleGetAuth: vi.fn(),
  handleDeleteAuth: vi.fn(),
}))

describe("POST /api/v1/public/auth", () => {
  test("should call handlePostAuth()", async () => {
    const { req, res } = mockRequestResponse({ method: "POST" })
    await apiAuthHandler(req, res)
    expect(handlePostAuth).toHaveBeenCalledWith({ req, res })
  })
})

describe("GET /api/v1/public/auth", () => {
  test("should call handleGetAuth()", async () => {
    const { req, res } = mockRequestResponse({ method: "GET" })
    await apiAuthHandler(req, res)
    expect(handleGetAuth).toHaveBeenCalledWith({ req, res })
  })
})

describe("DELETE /api/v1/public/auth", () => {
  test("should call handleDeleteAuth()", async () => {
    const { req, res } = mockRequestResponse({ method: "DELETE" })
    await apiAuthHandler(req, res)
    expect(handleDeleteAuth).toHaveBeenCalledWith({ req, res })
  })
})

describe("PUT /api/v1/public/auth", () => {
  test("should return an error message for not allowed method", async () => {
    const { req, res } = mockRequestResponse({ method: "PUT" })
    await apiAuthHandler(req, res)
    expect(res._getJSONData()).toStrictEqual({ error: "Method not allowed" })
    expect(res._getStatusCode()).toStrictEqual(405)
  })
})
