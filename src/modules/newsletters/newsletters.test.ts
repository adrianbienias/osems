import { prisma } from "@/libs/prisma"
import { uuidRegex } from "@/libs/validators"
import {
  getNewsletter,
  getNewsletters,
  scheduleNewsletter,
  sendNewsletters,
} from "@/modules/newsletters"
import { sendEmail } from "@/modules/sendings"
import { SETTINGS } from "@/settings"
import { copyFileSync } from "fs"
import { beforeEach, describe, expect, test, vi } from "vitest"

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

beforeEach(() => {
  copyFileSync("./prisma/empty-db.sqlite", "./prisma/test-db.sqlite")
})

describe("scheduleNewsletter()", () => {
  test("should add scheduled newsletters to database", async () => {
    expect(await prisma.newsletter.findMany()).toStrictEqual([])

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

    expect(await prisma.newsletter.findMany()).toStrictEqual([
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

    expect(await prisma.newsletterLogs.findMany()).toStrictEqual([])

    await prisma.settings.upsert({
      where: { key: SETTINGS.newsletter_sending_status.key },
      update: { value: SETTINGS.newsletter_sending_status.values.in_progress },
      create: {
        key: SETTINGS.newsletter_sending_status.key,
        value: SETTINGS.newsletter_sending_status.values.in_progress,
      },
    })

    const consoleInfoSpy = vi.spyOn(console, "info")

    await sendNewsletters()

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      "Busy... sending newsletter in progress"
    )
    expect(sendEmail).not.toHaveBeenCalled()
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

    expect(await prisma.newsletterLogs.findMany()).toStrictEqual([])

    await sendNewsletters()

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

    expect(await prisma.newsletterLogs.findMany()).toStrictEqual([
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
