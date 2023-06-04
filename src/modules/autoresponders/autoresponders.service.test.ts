import { getUnsubscribedContacts } from "@/modules/contacts"
import { sendEmail } from "@/modules/sendings"
import { cleanTestDatabase, seedTestDatabase } from "mocks/seed-db"
import { beforeEach, describe, expect, test, vi } from "vitest"
import {
  checkIfAutoresponderIsSending,
  getAutoresponderLogs,
} from "./autoresponders.model"
import { sendAutoresponders } from "./autoresponders.service"

vi.mock("@/modules/sendings", () => ({ sendEmail: vi.fn() }))
vi.mock("@/libs/datetime", () => ({ wait: vi.fn() }))

beforeEach(() => {
  cleanTestDatabase()
})

describe("sendAutoresponders()", () => {
  test("should send autoresponders while time passes", async () => {
    seedTestDatabase()

    const expectedNumberOfUnsubscribedContacts = 86

    const days = [
      { date: "2000-01-01", totalAutorespondersSent: 3 },
      { date: "2000-01-02", totalAutorespondersSent: 3 },
      { date: "2000-01-03", totalAutorespondersSent: 5 },
      { date: "2000-01-04", totalAutorespondersSent: 6 },
      { date: "2000-01-05", totalAutorespondersSent: 6 },
      { date: "2000-01-06", totalAutorespondersSent: 7 },
      { date: "2000-01-07", totalAutorespondersSent: 9 },
    ]

    expect(await checkIfAutoresponderIsSending()).toStrictEqual(false)

    for (const day of days) {
      vi.setSystemTime(new Date(day.date))

      expect((await getUnsubscribedContacts()).length).toStrictEqual(
        expectedNumberOfUnsubscribedContacts
      )

      await sendAutoresponders()

      const logs = await getAutoresponderLogs()
      expect(logs.length).toStrictEqual(day.totalAutorespondersSent)
      expect(vi.mocked(sendEmail).mock.calls.length).toStrictEqual(
        day.totalAutorespondersSent
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

      expect(await checkIfAutoresponderIsSending()).toStrictEqual(false)
    }

    vi.useRealTimers()
  })
})
