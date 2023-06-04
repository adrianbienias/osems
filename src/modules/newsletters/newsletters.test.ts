import { prisma } from "@/libs/prisma"
import { uuidRegex } from "@/libs/validators"
import { sendEmail } from "@/modules/sendings"
import { SETTINGS } from "@/settings"
import { cleanTestDatabase } from "mocks/seed-db"
import { beforeEach, describe, expect, test, vi } from "vitest"
import {
  getNewsletter,
  getNewsletterLogs,
  getNewsletters,
  scheduleNewsletter,
  setNewsletterSendingIdle,
  setNewsletterSendingInProgress,
} from "./newsletters.model"
import { sendNewsletters } from "./newsletters.service"

const toSendAfter = new Date()

vi.mock("@/libs/datetime", () => ({ wait: vi.fn() }))
vi.mock("@/modules/sendings", () => ({ sendEmail: vi.fn() }))
vi.mock("@/modules/contacts", () => ({
  getContactsToSend: vi.fn().mockResolvedValue([
    { email: "foo-1@bar.baz", confirmedAt: new Date() },
    { email: "foo-2@bar.baz", confirmedAt: new Date() },
    { email: "foo-3@bar.baz", confirmedAt: new Date() },
  ]),
}))
vi.mock("@/modules/templates", () => {
  const templateMock = {
    subject: "Dummy subject",
    html: "<p>Dummy html content</p>",
    text: "Dummy text content",
  }

  return {
    addTemplate: vi.fn().mockResolvedValue({ id: "newsletter-template-id" }),
    getTemplate: vi.fn().mockResolvedValue(templateMock),
    parseTemplateVariables: vi.fn().mockReturnValue(templateMock),
  }
})

vi.mock("./newsletters.model", async () => {
  return {
    ...(await vi.importActual<typeof import("./newsletters.model")>(
      "./newsletters.model"
    )),
    setNewsletterSendingInProgress: vi.fn(),
    setNewsletterSendingIdle: vi.fn(),
  }
})

beforeEach(() => {
  cleanTestDatabase()
})

describe("scheduleNewsletter()", () => {
  test("should add scheduled newsletters to database", async () => {
    expect(await getNewsletters()).toStrictEqual([])

    await scheduleNewsletter({
      listIdToInclude: "list-id-to-include",
      listIdsToExclude: JSON.stringify([
        "list-id-to-exclude-1",
        "list-id-to-exclude-2",
      ]),
      newsletterTemplate: {
        subject: "Dummy newsletter subject",
        html: "<p>Dummy newsletter content</p>",
      },
      toSendAfter,
    })
    await scheduleNewsletter({
      listIdToInclude: "list-id-to-include",
      listIdsToExclude: JSON.stringify([
        "list-id-to-exclude-1",
        "list-id-to-exclude-2",
      ]),
      newsletterTemplate: {
        subject: "Dummy newsletter subject",
        html: "<p>Dummy newsletter content</p>",
      },
      toSendAfter,
    })

    expect(await getNewsletters()).toStrictEqual([
      {
        id: expect.stringMatching(uuidRegex),
        listIdToInclude: "list-id-to-include",
        listIdsToExclude: '["list-id-to-exclude-1","list-id-to-exclude-2"]',
        templateId: "newsletter-template-id",
        sentAt: null,
        createdAt: expect.any(Date),
        toSendAfter: expect.any(Date),
      },
      {
        id: expect.stringMatching(uuidRegex),
        listIdToInclude: "list-id-to-include",
        listIdsToExclude: '["list-id-to-exclude-1","list-id-to-exclude-2"]',
        templateId: "newsletter-template-id",
        sentAt: null,
        createdAt: expect.any(Date),
        toSendAfter: expect.any(Date),
      },
    ])
  })
})

describe("getNewsletters()", () => {
  test("should get all newsletters", async () => {
    await scheduleNewsletter({
      listIdToInclude: "list-id-to-include-1",
      listIdsToExclude: JSON.stringify([
        "list-id-to-exclude-1",
        "list-id-to-exclude-2",
      ]),
      newsletterTemplate: {
        subject: "Dummy newsletter subject #1",
        html: "<p>Dummy newsletter content #1</p>",
      },
      toSendAfter,
    })
    await scheduleNewsletter({
      listIdToInclude: "list-id-to-include-2",
      listIdsToExclude: JSON.stringify([
        "list-id-to-exclude-1",
        "list-id-to-exclude-2",
      ]),
      newsletterTemplate: {
        subject: "Dummy newsletter subject #2",
        html: "<p>Dummy newsletter content #2</p>",
      },
      toSendAfter,
    })

    expect(await getNewsletters()).toStrictEqual([
      {
        id: expect.stringMatching(uuidRegex),
        listIdToInclude: "list-id-to-include-1",
        listIdsToExclude: '["list-id-to-exclude-1","list-id-to-exclude-2"]',
        templateId: "newsletter-template-id",
        toSendAfter: expect.any(Date),
        sentAt: null,
        createdAt: expect.any(Date),
      },
      {
        id: expect.stringMatching(uuidRegex),
        listIdToInclude: "list-id-to-include-2",
        listIdsToExclude: '["list-id-to-exclude-1","list-id-to-exclude-2"]',
        templateId: "newsletter-template-id",
        toSendAfter: expect.any(Date),
        sentAt: null,
        createdAt: expect.any(Date),
      },
    ])
  })
})

describe("getNewsletter()", () => {
  test("should get all newsletters", async () => {
    const newsletter = await scheduleNewsletter({
      listIdToInclude: "list-id-to-include-1",
      listIdsToExclude: JSON.stringify([
        "list-id-to-exclude-1",
        "list-id-to-exclude-2",
      ]),
      newsletterTemplate: {
        subject: "Dummy newsletter subject #1",
        html: "<p>Dummy newsletter content #1</p>",
      },
      toSendAfter,
    })
    if (newsletter instanceof Error) {
      return expect(newsletter).not.toBeInstanceOf(Error)
    }

    expect(await getNewsletter({ id: newsletter.id })).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      listIdToInclude: "list-id-to-include-1",
      listIdsToExclude: '["list-id-to-exclude-1","list-id-to-exclude-2"]',
      templateId: "newsletter-template-id",
      toSendAfter: expect.any(Date),
      sentAt: null,
      createdAt: expect.any(Date),
      logs: [],
    })
  })
})

describe("sendNewsletters()", () => {
  test("should not send newsletter when another one is being sent", async () => {
    const newsletter = await scheduleNewsletter({
      listIdToInclude: "list-id-to-include",
      listIdsToExclude: JSON.stringify([
        "list-id-to-exclude-1",
        "list-id-to-exclude-2",
      ]),
      newsletterTemplate: {
        subject: "Dummy newsletter subject",
        html: "<p>Dummy newsletter content</p>",
      },
      toSendAfter,
    })
    if (newsletter instanceof Error) {
      return expect(newsletter).not.toBeInstanceOf(Error)
    }

    expect(await getNewsletterLogs()).toStrictEqual([])

    const newslettersModel = await vi.importActual<
      typeof import("./newsletters.model")
    >("./newsletters.model")
    newslettersModel.setNewsletterSendingInProgress()

    const originalConsoleInfo = console.info
    vi.spyOn(console, "info")

    await sendNewsletters()

    expect(console.info).toHaveBeenCalledWith(
      "Busy... sending newsletter in progress"
    )
    console.info = originalConsoleInfo

    expect(sendEmail).not.toHaveBeenCalled()
    expect(setNewsletterSendingInProgress).not.toHaveBeenCalled()
    expect(setNewsletterSendingIdle).not.toHaveBeenCalled()
  })

  test("should call nodemailer sendMail() method", async () => {
    const newsletter = await scheduleNewsletter({
      listIdToInclude: "list-id-to-include",
      listIdsToExclude: JSON.stringify([
        "list-id-to-exclude-1",
        "list-id-to-exclude-2",
      ]),
      newsletterTemplate: {
        subject: "Dummy newsletter subject",
        html: "<p>Dummy newsletter content</p>",
      },
      toSendAfter,
    })
    if (newsletter instanceof Error) {
      return expect(newsletter).not.toBeInstanceOf(Error)
    }

    expect(await getNewsletterLogs()).toStrictEqual([])

    await sendNewsletters()

    expect(setNewsletterSendingInProgress).toHaveBeenCalledTimes(1)
    expect(setNewsletterSendingIdle).toHaveBeenCalledTimes(1)

    expect(sendEmail).toHaveBeenNthCalledWith(1, {
      to: "foo-1@bar.baz",
      subject: "Dummy subject",
      html: "<p>Dummy html content</p>",
      text: "Dummy text content",
    })
    expect(sendEmail).toHaveBeenNthCalledWith(2, {
      to: "foo-2@bar.baz",
      subject: "Dummy subject",
      html: "<p>Dummy html content</p>",
      text: "Dummy text content",
    })
    expect(sendEmail).toHaveBeenNthCalledWith(3, {
      to: "foo-3@bar.baz",
      subject: "Dummy subject",
      html: "<p>Dummy html content</p>",
      text: "Dummy text content",
    })

    expect(await getNewsletterLogs()).toStrictEqual([
      {
        email: "foo-1@bar.baz",
        newsletterId: expect.stringMatching(uuidRegex),
        sentAt: expect.any(Date),
        createdAt: expect.any(Date),
      },
      {
        email: "foo-2@bar.baz",
        newsletterId: expect.stringMatching(uuidRegex),
        sentAt: expect.any(Date),
        createdAt: expect.any(Date),
      },
      {
        email: "foo-3@bar.baz",
        newsletterId: expect.stringMatching(uuidRegex),
        sentAt: expect.any(Date),
        createdAt: expect.any(Date),
      },
    ])
  })
})
