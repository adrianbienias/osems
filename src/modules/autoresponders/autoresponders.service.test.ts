import { prisma } from "@/libs/prisma"
import { sendAutoresponders } from "@/modules/autoresponders"
import { sendEmail } from "@/modules/sendings"
import { copyFileSync } from "fs"
import { beforeEach, describe, expect, test, vi } from "vitest"

vi.mock("@/modules/sendings", () => ({ sendEmail: vi.fn() }))
vi.mock("@/libs/datetime", () => ({ wait: vi.fn() }))

beforeEach(() => {
  copyFileSync("./prisma/empty-db.sqlite", "./prisma/test-db.sqlite")
})

describe("sendAutoresponders()", () => {
  test("should send autoresponders while time passes", async () => {
    copyFileSync("./prisma/seeded-db.sqlite", "./prisma/test-db.sqlite")

    const expectedNumberOfUnsubscribedContacts = 86

    const days = [
      { date: "2000-01-01", expectedNumberOfAutoresponders: 3 },
      { date: "2000-01-02", expectedNumberOfAutoresponders: 3 },
      { date: "2000-01-03", expectedNumberOfAutoresponders: 5 },
      { date: "2000-01-04", expectedNumberOfAutoresponders: 6 },
      { date: "2000-01-05", expectedNumberOfAutoresponders: 6 },
      { date: "2000-01-06", expectedNumberOfAutoresponders: 7 },
      { date: "2000-01-07", expectedNumberOfAutoresponders: 9 },
    ]

    expect(
      await prisma.setting.findUnique({
        where: { key: "autoresponder_sending_status" },
      })
    ).toStrictEqual(null)

    for (const day of days) {
      vi.setSystemTime(new Date(day.date))

      const unsubscribedContacts = await prisma.contact.findMany({
        where: { unsubscribedAt: { not: null } },
      })
      expect(unsubscribedContacts.length).toStrictEqual(
        expectedNumberOfUnsubscribedContacts
      )

      await sendAutoresponders()

      const logs = await prisma.autoresponderLogs.findMany()
      expect(logs.length).toStrictEqual(day.expectedNumberOfAutoresponders)
      expect(vi.mocked(sendEmail).mock.calls.length).toStrictEqual(
        day.expectedNumberOfAutoresponders
      )
      expect(sendEmail).toHaveBeenCalledTimes(logs.length)

      for (let i = 0; i < logs.length; i++) {
        expect(sendEmail).toHaveBeenNthCalledWith(
          i + 1,
          expect.objectContaining({
            to: logs[i].email,
          })
        )
      }

      expect(
        (
          await prisma.setting.findUnique({
            where: { key: "autoresponder_sending_status" },
          })
        )?.value
      ).toStrictEqual("idle")
    }

    vi.useRealTimers()
  })
})
