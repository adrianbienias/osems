import {
  getNewsletter,
  getNewsletters,
  scheduleNewsletter,
} from "@/modules/newsletters"
import { getTemplate } from "@/modules/templates"
import apiNewslettersHandler from "@/pages/api/v1/newsletters"
import apiNewsletterHandler from "@/pages/api/v1/newsletters/[newsletterId]"
import { describe, expect, test, vi } from "vitest"
import { mockRequestResponse } from "../../../mocks/api-mocks"

vi.mock("@/modules/lists", () => {
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

vi.mock("@/modules/newsletters", () => {
  return {
    scheduleNewsletter: vi.fn().mockResolvedValue({}),
    sendNewsletters: vi.fn().mockResolvedValue(undefined),
    getNewsletters: vi.fn().mockResolvedValue([]),
    getNewsletter: vi
      .fn()
      .mockResolvedValue({ templateId: "dummy-newsletter-template-id" }),
  }
})

vi.mock("@/modules/templates", () => {
  return {
    getTemplate: vi.fn(),
  }
})

describe("/api/newsletters", () => {
  test("should schedule newsletter", async () => {
    const { req, res } = mockRequestResponse({
      method: "POST",
      body: {
        subject: "Dummy subject",
        html: `<p>Dummy email content</p><p><a href="{{unsubscribe}}">Unsubscribe</a></p>`,
        listIdToInclude: "list-id-to-include",
        listIdsToExclude: ["list-id-to-exclude"],
        toSendAfter: new Date().toISOString(),
      },
    })

    await apiNewslettersHandler(req, res)

    expect(res._getJSONData()).toStrictEqual({ success: "Ok", newsletter: {} })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(scheduleNewsletter).toBeCalledWith({
      listIdToInclude: "list-id-to-include",
      listIdsToExclude: JSON.stringify(["list-id-to-exclude"]),
      newsletterTemplate: {
        html: `<p>Dummy email content</p><p><a href="{{unsubscribe}}">Unsubscribe</a></p>`,
        subject: "Dummy subject",
      },
      toSendAfter: expect.any(Date),
    })
  })

  test("should get newsletters", async () => {
    const { req, res } = mockRequestResponse({
      method: "GET",
    })

    await apiNewslettersHandler(req, res)

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      newslettersWithTemplate: [],
    })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(getNewsletters).toHaveBeenCalled()
  })
})

describe("/api/newsletters/:newsletterId", () => {
  test("should get newsletter", async () => {
    const { req, res } = mockRequestResponse({
      method: "GET",
      query: {
        newsletterId: "dummy-newsletter-id",
      },
    })

    await apiNewsletterHandler(req, res)

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      newsletter: { templateId: "dummy-newsletter-template-id" },
    })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(getNewsletter).toHaveBeenCalledWith({ id: "dummy-newsletter-id" })
    expect(getTemplate).toHaveBeenCalledWith({
      id: "dummy-newsletter-template-id",
    })
  })
})
