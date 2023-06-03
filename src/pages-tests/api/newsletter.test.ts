import {
  handleGetNewsletter,
  handleGetNewsletters,
  handlePostNewsletter,
} from "@/modules/newsletters"
import apiNewslettersHandler from "@/pages/api/v1/newsletters"
import apiNewsletterHandler from "@/pages/api/v1/newsletters/[newsletterId]"
import { describe, expect, test, vi } from "vitest"
import { mockRequestResponse } from "../../../mocks/api-mocks"

vi.mock("@/modules/newsletters", () => ({
  handlePostNewsletter: vi.fn(),
  handleGetNewsletters: vi.fn(),
  handleGetNewsletter: vi.fn(),
}))

describe("POST /api/v1/newsletters", () => {
  test("should call handlePostNewsletter()", async () => {
    const { req, res } = mockRequestResponse({
      method: "POST",
      body: { foo: "bar" },
    })
    await apiNewslettersHandler(req, res)
    expect(handlePostNewsletter).toHaveBeenCalledWith({ req, res })
  })
})

describe("GET /api/v1/newsletters", () => {
  test("should call handleGetNewsletters()", async () => {
    const { req, res } = mockRequestResponse({
      method: "GET",
    })
    await apiNewslettersHandler(req, res)
    expect(handleGetNewsletters).toHaveBeenCalledWith({ req, res })
  })
})

describe("GET /api/v1/newsletters/:newsletterId", () => {
  test("should call handleGetNewsletter()", async () => {
    const { req, res } = mockRequestResponse({
      method: "GET",
      query: {
        newsletterId: "dummy-newsletter-id",
      },
    })
    await apiNewsletterHandler(req, res)
    expect(handleGetNewsletter).toHaveBeenCalledWith({ req, res })
  })
})
