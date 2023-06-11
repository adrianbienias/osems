import { getUnsubscribedContacts } from "@/modules/contacts"
import { sendEmail } from "@/modules/sendings"
import { cleanTestDatabase, seedTestDatabase } from "mocks/seed-db"
import { beforeEach, describe, expect, test, vi } from "vitest"
import {
  checkIfAutoresponderIsSending,
  getAutoresponderLogs,
} from "./autoresponders.model"
import { sendAutoresponders } from "./autoresponders.service"
import { setAutoresponderSendingInProgress } from "./autoresponders.model"
import { setAutoresponderSendingIdle } from "./autoresponders.model"

vi.mock("@/modules/sendings", () => ({ sendEmail: vi.fn() }))
vi.mock("@/libs/datetime", () => ({ wait: vi.fn() }))
vi.mock("./autoresponders.model", async () => {
  const actual = await vi.importActual<typeof import("./autoresponders.model")>(
    "./autoresponders.model"
  )
  return {
    ...actual,
    setAutoresponderSendingInProgress: vi.fn(),
    setAutoresponderSendingIdle: vi.fn(),
  }
})

beforeEach(() => {
  cleanTestDatabase()
})

describe("sendAutoresponders()", () => {
  test("should send autoresponders while time passes", async () => {
    seedTestDatabase()

    const days = [
      { date: "2000-01-01", totalAutorespondersSent: 3 },
      { date: "2000-01-02", totalAutorespondersSent: 3 },
      { date: "2000-01-03", totalAutorespondersSent: 5 },
      { date: "2000-01-04", totalAutorespondersSent: 6 },
      { date: "2000-01-05", totalAutorespondersSent: 6 },
      { date: "2000-01-06", totalAutorespondersSent: 7 },
      { date: "2000-01-07", totalAutorespondersSent: 9 },
    ]

    expect((await getUnsubscribedContacts()).length).toStrictEqual(86)

    for (const day of days) {
      expect(await checkIfAutoresponderIsSending()).toStrictEqual(false)

      vi.setSystemTime(new Date(day.date))

      await sendAutoresponders()

      vi.useRealTimers()

      const logs = await getAutoresponderLogs()
      expect(logs.length).toStrictEqual(day.totalAutorespondersSent)
      expect(sendEmail).toHaveBeenCalledTimes(day.totalAutorespondersSent)

      for (let i = 0; i < logs.length; i++) {
        expect(sendEmail).toHaveBeenNthCalledWith(
          i + 1,
          expect.objectContaining({ to: logs[i].email })
        )
      }

      expect(await checkIfAutoresponderIsSending()).toStrictEqual(false)
    }

    expect(setAutoresponderSendingInProgress).toHaveBeenCalledTimes(days.length)
    expect(setAutoresponderSendingIdle).toHaveBeenCalledTimes(days.length)
  })
})
