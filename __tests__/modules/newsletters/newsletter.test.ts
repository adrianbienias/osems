import { prisma } from "@/libs/prisma"
import {
  getNewsletter,
  getNewsletters,
  scheduleNewsletter,
  sendNewsletters,
} from "@/modules/newsletters"
import { sendEmail } from "@/modules/sendings"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { cleanDatabase } from "../../before-each"

vi.mock("@/libs/datetime", () => ({ wait: vi.fn() }))
vi.mock("@/modules/sendings", () => ({ sendEmail: vi.fn() }))
vi.mock("@/modules/lists", () => {
  return {
    getList: vi.fn().mockImplementation(({ id }) => {
      if (id === "list-id-to-include") {
        return Promise.resolve({
          contacts: [
            { email: "foo-1@bar.baz", confirmedAt: new Date() },
            { email: "foo-2@bar.baz", confirmedAt: new Date() },
            { email: "foo-3@bar.baz", confirmedAt: new Date() },
            { email: "foo-4@bar.baz", confirmedAt: new Date() },
            { email: "foo-5@bar.baz", confirmedAt: new Date() },
          ],
        })
      }
      if (id === "list-id-to-exclude-1") {
        return Promise.resolve({
          contacts: [
            { email: "foo-2@bar.baz", confirmedAt: new Date() },
            { email: "foo-4@bar.baz", confirmedAt: new Date() },
          ],
        })
      }
      if (id === "list-id-to-exclude-2") {
        return Promise.resolve({
          contacts: [{ email: "foo-5@bar.baz", confirmedAt: new Date() }],
        })
      }
    }),
  }
})
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

const uuidRegex = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/
const from = "foo@bar.baz"
const toSendAfter = new Date()

beforeEach(async () => {
  await cleanDatabase()
})

describe("scheduleNewsletter()", () => {
  test("should add scheduled newsletters to database", async () => {
    expect(await prisma.newsletter.findMany()).toStrictEqual([])

    await scheduleNewsletter({
      from,
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
      from,
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
        from,
        id: expect.stringMatching(uuidRegex),
        listIdToInclude: "list-id-to-include",
        listIdsToExclude: '["list-id-to-exclude-1","list-id-to-exclude-2"]',
        templateId: "newsletter-template-id",
        isSending: false,
        sentAt: null,
        createdAt: expect.any(Date),
        toSendAfter: expect.any(Date),
      },
      {
        from,
        id: expect.stringMatching(uuidRegex),
        listIdToInclude: "list-id-to-include",
        listIdsToExclude: '["list-id-to-exclude-1","list-id-to-exclude-2"]',
        templateId: "newsletter-template-id",
        isSending: false,
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
      from,
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
      from,
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
        from: "foo@bar.baz",
        templateId: "newsletter-template-id",
        toSendAfter: expect.any(Date),
        isSending: false,
        sentAt: null,
        createdAt: expect.any(Date),
      },
      {
        id: expect.stringMatching(uuidRegex),
        listIdToInclude: "list-id-to-include-2",
        listIdsToExclude: '["list-id-to-exclude-1","list-id-to-exclude-2"]',
        from: "foo@bar.baz",
        templateId: "newsletter-template-id",
        toSendAfter: expect.any(Date),
        isSending: false,
        sentAt: null,
        createdAt: expect.any(Date),
      },
    ])
  })
})

describe("getNewsletter()", () => {
  test("should get all newsletters", async () => {
    const newsletter = await scheduleNewsletter({
      from,
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
      from: "foo@bar.baz",
      templateId: "newsletter-template-id",
      toSendAfter: expect.any(Date),
      isSending: false,
      sentAt: null,
      createdAt: expect.any(Date),
      sendings: [],
    })
  })
})

describe("sendNewsletters()", () => {
  test("should not send newsletter when another one is being sent", async () => {
    const newsletter = await scheduleNewsletter({
      from,
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

    expect(await prisma.sending.findMany()).toStrictEqual([])

    await prisma.newsletter.update({
      where: { id: newsletter.id },
      data: { isSending: true },
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
      from,
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

    expect(await prisma.sending.findMany()).toStrictEqual([])

    await sendNewsletters()

    expect(sendEmail).toHaveBeenNthCalledWith(1, {
      from: "foo@bar.baz",
      to: "foo-1@bar.baz",
      subject: "Dummy subject",
      html: "<p>Dummy html content</p>",
      text: "Dummy text content",
    })
    expect(sendEmail).toHaveBeenNthCalledWith(2, {
      from: "foo@bar.baz",
      to: "foo-3@bar.baz",
      subject: "Dummy subject",
      html: "<p>Dummy html content</p>",
      text: "Dummy text content",
    })

    expect(await prisma.sending.findMany()).toStrictEqual([
      {
        email: "foo-1@bar.baz",
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
