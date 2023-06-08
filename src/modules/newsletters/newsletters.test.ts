import { uuidRegex } from "@/libs/validators"
import { sendEmail } from "@/modules/sendings"
import { cleanTestDatabase, seedTestDatabase } from "mocks/seed-db"
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
import testData from "../../../mocks/test-data.json"

const toSendAfter = new Date()

vi.mock("@/libs/datetime", () => ({ wait: vi.fn() }))
vi.mock("@/modules/sendings", () => ({ sendEmail: vi.fn() }))
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
    seedTestDatabase()

    await scheduleNewsletter({
      listId: "048df004-02a0-4b26-b77a-0d6f713fac4c",
      listIdsToExclude: JSON.stringify([
        "180d1933-5f45-445a-87dd-0ce8cbb86c6d",
        "2e4b0581-0bdc-4a54-bc05-8877b8808a40",
      ]),
      newsletterTemplate: testData.newsletterTemplate,
      toSendAfter,
    })
    await scheduleNewsletter({
      listId: "048df004-02a0-4b26-b77a-0d6f713fac4c",
      listIdsToExclude: JSON.stringify([
        "180d1933-5f45-445a-87dd-0ce8cbb86c6d",
        "2e4b0581-0bdc-4a54-bc05-8877b8808a40",
      ]),
      newsletterTemplate: testData.newsletterTemplate,
      toSendAfter,
    })

    expect(await getNewsletters()).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.stringMatching(uuidRegex),
          listId: "048df004-02a0-4b26-b77a-0d6f713fac4c",
          listIdsToExclude:
            '["180d1933-5f45-445a-87dd-0ce8cbb86c6d","2e4b0581-0bdc-4a54-bc05-8877b8808a40"]',
          templateId: expect.stringMatching(uuidRegex),
          sentAt: null,
          createdAt: expect.any(Date),
          toSendAfter: expect.any(Date),
        },
        {
          id: expect.stringMatching(uuidRegex),
          listId: "048df004-02a0-4b26-b77a-0d6f713fac4c",
          listIdsToExclude:
            '["180d1933-5f45-445a-87dd-0ce8cbb86c6d","2e4b0581-0bdc-4a54-bc05-8877b8808a40"]',
          templateId: expect.stringMatching(uuidRegex),
          sentAt: null,
          createdAt: expect.any(Date),
          toSendAfter: expect.any(Date),
        },
      ])
    )
  })
})

describe("getNewsletters()", () => {
  test("should get all newsletters from database", async () => {
    seedTestDatabase()

    const newsletters = await getNewsletters()
    if (newsletters instanceof Error) {
      return expect(newsletters).not.toBeInstanceOf(Error)
    }

    expect(newsletters.length).toStrictEqual(14)
    expect(newsletters).toStrictEqual(
      expect.arrayContaining([
        {
          id: "5d972ea3-4e2f-4e4c-832f-88f03722422e",
          listId: "180d1933-5f45-445a-87dd-0ce8cbb86c6d",
          listIdsToExclude:
            '["2472375a-a373-4aa2-b13f-6dc3118854c8","048df004-02a0-4b26-b77a-0d6f713fac4c","2e4b0581-0bdc-4a54-bc05-8877b8808a40"]',
          templateId: "6e3d0ce7-59cb-48c7-89b3-5c09b9bd5e74",
          toSendAfter: expect.any(Date),
          sentAt: null,
          createdAt: expect.any(Date),
        },
      ])
    )
  })
})

describe("getNewsletter()", () => {
  test("should get single newsletter", async () => {
    seedTestDatabase()

    expect(
      await getNewsletter({ id: "04c16fd0-8645-45d4-bc87-9bad2f706904" })
    ).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      listId: "3ec8b12c-f1fb-432e-adf9-7a5e7c35f6af",
      listIdsToExclude:
        '["180d1933-5f45-445a-87dd-0ce8cbb86c6d","2e4b0581-0bdc-4a54-bc05-8877b8808a40"]',
      templateId: "60af76e6-bc52-4370-9d95-216636ab4d1a",
      toSendAfter: new Date("2000-06-14T21:21:55.056Z"),
      sentAt: null,
      createdAt: new Date("2000-03-07T18:53:17.880Z"),
      logs: [],
    })
  })
})

describe("sendNewsletters()", () => {
  test("should not send newsletter when another one is being sent", async () => {
    seedTestDatabase()

    expect(await getNewsletterLogs()).toStrictEqual([])

    const newslettersModel = await vi.importActual<
      typeof import("./newsletters.model")
    >("./newsletters.model")

    newslettersModel.setNewsletterSendingInProgress()

    const originalConsoleInfo = console.info
    vi.spyOn(console, "info").mockImplementation(() => vi.fn())

    await sendNewsletters()

    expect(console.info).toHaveBeenCalledWith(
      "Busy... sending newsletter in progress"
    )
    console.info = originalConsoleInfo

    expect(sendEmail).not.toHaveBeenCalled()
    expect(setNewsletterSendingInProgress).not.toHaveBeenCalled()
    expect(setNewsletterSendingIdle).not.toHaveBeenCalled()
    expect(await getNewsletterLogs()).toStrictEqual([])
  })

  test("should call nodemailer sendMail() method", async () => {
    seedTestDatabase()

    expect(await getNewsletterLogs()).toStrictEqual([])

    vi.useFakeTimers()
    vi.setSystemTime(new Date("1999-09-22"))

    await sendNewsletters()

    vi.useRealTimers()

    expect(setNewsletterSendingInProgress).toHaveBeenCalledTimes(1)
    expect(setNewsletterSendingIdle).toHaveBeenCalledTimes(1)

    expect(sendEmail).toHaveBeenCalledTimes(43)
    expect(sendEmail).toHaveBeenNthCalledWith(1, {
      to: "santa_wiza@yahoo.com",
      subject: "Dummy newsletter subject",
      html: `<p>Dummy newsletter content. <a href="http://localhost:3000/api/v1/public/contacts?email=santa_wiza%2540yahoo.com&listId=048df004-02a0-4b26-b77a-0d6f713fac4c&action=unsubscribe">Unsubscribe</a></p>`,
      text: `Dummy newsletter content. Unsubscribe [http://localhost:3000/api/v1/public/contacts?email=santa_wiza%2540yahoo.com&listId=048df004-02a0-4b26-b77a-0d6f713fac4c&action=unsubscribe]`,
    })
    expect(sendEmail).toHaveBeenNthCalledWith(20, {
      to: "lou16@gmail.com",
      subject: "Dummy newsletter subject",
      html: `<p>Dummy newsletter content. <a href="http://localhost:3000/api/v1/public/contacts?email=lou16%2540gmail.com&listId=048df004-02a0-4b26-b77a-0d6f713fac4c&action=unsubscribe">Unsubscribe</a></p>`,
      text: `Dummy newsletter content. Unsubscribe [http://localhost:3000/api/v1/public/contacts?email=lou16%2540gmail.com&listId=048df004-02a0-4b26-b77a-0d6f713fac4c&action=unsubscribe]`,
    })
    expect(sendEmail).toHaveBeenNthCalledWith(43, {
      to: "mittie.kuhn84@gmail.com",
      subject: "Dummy newsletter subject",
      html: `<p>Dummy newsletter content. <a href="http://localhost:3000/api/v1/public/contacts?email=mittie.kuhn84%2540gmail.com&listId=048df004-02a0-4b26-b77a-0d6f713fac4c&action=unsubscribe">Unsubscribe</a></p>`,
      text: `Dummy newsletter content. Unsubscribe [http://localhost:3000/api/v1/public/contacts?email=mittie.kuhn84%2540gmail.com&listId=048df004-02a0-4b26-b77a-0d6f713fac4c&action=unsubscribe]`,
    })

    expect((await getNewsletterLogs()).length).toStrictEqual(43)
    expect(await getNewsletterLogs()).toStrictEqual(
      expect.arrayContaining([
        {
          email: "santa_wiza@yahoo.com",
          newsletterId: expect.stringMatching(uuidRegex),
          sentAt: expect.any(Date),
          createdAt: expect.any(Date),
        },
        {
          email: "lou16@gmail.com",
          newsletterId: expect.stringMatching(uuidRegex),
          sentAt: expect.any(Date),
          createdAt: expect.any(Date),
        },
        {
          email: "mittie.kuhn84@gmail.com",
          newsletterId: expect.stringMatching(uuidRegex),
          sentAt: expect.any(Date),
          createdAt: expect.any(Date),
        },
      ])
    )
  })
})
