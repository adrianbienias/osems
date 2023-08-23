import { describe, expect, test, vi } from "vitest"
import {
  handleGetAutoresponder,
  handleGetAutoresponders,
  handlePatchAutoresponder,
  handlePostAutoresponders,
} from "@/modules/autoresponders"
import apiAutorespondersHandler from "@/pages/api/v1/autoresponders"
import apiAutoresponderHandler from "@/pages/api/v1/autoresponders/[autoresponderId]"
import { mockRequestResponse } from "../../../mocks/api-mocks"

vi.mock("@/modules/autoresponders", () => ({
  handlePostAutoresponders: vi.fn(),
  handleGetAutoresponders: vi.fn(),
  handleGetAutoresponder: vi.fn(),
  handlePatchAutoresponder: vi.fn(),
}))

describe("POST /api/v1/public/autoresponders", () => {
  test("should call handlePostAutoresponders()", async () => {
    const { req, res } = mockRequestResponse({ method: "POST" })
    await apiAutorespondersHandler(req, res)
    expect(handlePostAutoresponders).toHaveBeenCalledWith({ req, res })
  })
})

describe("GET /api/v1/public/autoresponders", () => {
  test("should call handleGetAutoresponders()", async () => {
    const { req, res } = mockRequestResponse({ method: "GET" })
    await apiAutorespondersHandler(req, res)
    expect(handleGetAutoresponders).toHaveBeenCalledWith({ req, res })
  })
})

describe("GET /api/v1/public/autoresponder/:autoresponderId", () => {
  test("should call handleGetAutoresponder()", async () => {
    const { req, res } = mockRequestResponse({ method: "GET" })
    await apiAutoresponderHandler(req, res)
    expect(handleGetAutoresponder).toHaveBeenCalledWith({ req, res })
  })
})

describe("PATCH /api/v1/public/autoresponder/:autoresponderId", () => {
  test("should call handlePatchAutoresponder()", async () => {
    const { req, res } = mockRequestResponse({ method: "PATCH" })
    await apiAutoresponderHandler(req, res)
    expect(handlePatchAutoresponder).toHaveBeenCalledWith({ req, res })
  })
})
