import { describe, expect, test, vi } from "vitest"
import { getListsByIds } from "@/modules/lists"
import { getTemplate } from "@/modules/templates"
import { mockRequestResponse } from "../../../mocks/api-mocks"
import {
  getNewsletter,
  getNewsletters,
  scheduleNewsletter,
} from "./newsletters.model"
import {
  handleGetNewsletter,
  handleGetNewsletters,
  handlePostNewsletter,
} from "./newsletters.route"

vi.mock("@/modules/lists", () => ({
  getListsByIds: vi.fn().mockResolvedValue(["excluded-list-id"]),
  getListWithContacts: vi
    .fn()
    .mockResolvedValue({ contacts: [{ dummy: "contact" }] }),
}))
vi.mock("./newsletters.model", () => ({
  scheduleNewsletter: vi.fn().mockResolvedValue({ dummy: "newsletter" }),
  getNewsletters: vi.fn().mockResolvedValue([{ dummy: "newsletter" }]),
  getNewsletter: vi.fn().mockResolvedValue({
    dummy: "newsletter",
    templateId: "dummy-template-id",
    listIdsToExclude: '["excluded-list-id"]',
  }),
}))
vi.mock("@/modules/templates", () => ({
  getTemplate: vi.fn().mockResolvedValue({ dummy: "template" }),
}))

describe("POST /api/v1/newsletters", () => {
  test("should call scheduleNewsletter() with request parameters", async () => {
    const { req, res } = mockRequestResponse({
      method: "POST",
      body: {
        subject: "Dummy subject",
        preheader: "Dummy preheader",
        markdown: `<p>Dummy email content</p><p><a href="{{unsubscribe}}">Unsubscribe</a></p>`,
        listId: "list-id-to-include",
        listIdsToExclude: ["list-id-to-exclude"],
        toSendAfter: new Date().toISOString(),
      },
    })

    await handlePostNewsletter({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      newsletter: { dummy: "newsletter" },
    })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(scheduleNewsletter).toBeCalledWith({
      listId: "list-id-to-include",
      listIdsToExclude: JSON.stringify(["list-id-to-exclude"]),
      newsletterTemplate: {
        subject: "Dummy subject",
        preheader: "Dummy preheader",
        markdown: `<p>Dummy email content</p><p><a href="{{unsubscribe}}">Unsubscribe</a></p>`,
      },
      toSendAfter: expect.any(Date),
    })
  })
})

describe("GET /api/v1/newsletters", () => {
  test("should call getNewsletters()", async () => {
    const { req, res } = mockRequestResponse({
      method: "GET",
    })

    await handleGetNewsletters({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      newslettersWithTemplate: [
        { dummy: "newsletter", template: { dummy: "template" } },
      ],
    })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(getNewsletters).toHaveBeenCalled()
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

    await handleGetNewsletter({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      newsletter: {
        dummy: "newsletter",
        templateId: "dummy-template-id",
        listIdsToExclude: '["excluded-list-id"]',
      },
      template: { dummy: "template" },
      excludedLists: ["excluded-list-id"],
    })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(getNewsletter).toHaveBeenCalledWith({ id: "dummy-newsletter-id" })
    expect(getTemplate).toHaveBeenCalledWith({ id: "dummy-template-id" })
    expect(getListsByIds).toHaveBeenCalled()
  })
})
