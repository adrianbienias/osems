import { cleanTestDatabase, seedTestDatabase } from "mocks/seed-db"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { getUnsubscribedContacts } from "@/modules/contacts"
import { sendEmail } from "@/modules/sendings"
import {
  checkIfAutoresponderIsSending,
  getAutoresponderLogs,
  setAutoresponderSendingIdle,
  setAutoresponderSendingInProgress,
} from "./autoresponders.model"
import { sendAutoresponders } from "./autoresponders.service"

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

    const numberOfCallsSimulatingCron = 3
    const days = [
      { date: "2000-01-11", totalAutorespondersSent: 6 },
      { date: "2000-01-12", totalAutorespondersSent: 7 },
      { date: "2000-01-13", totalAutorespondersSent: 11 },
      { date: "2000-01-14", totalAutorespondersSent: 11 },
      { date: "2000-01-15", totalAutorespondersSent: 18 },
    ]

    expect((await getUnsubscribedContacts()).length).toStrictEqual(86)

    const originalConsoleError = console.error
    vi.spyOn(console, "error").mockImplementation(() => vi.fn())

    for (const day of days) {
      expect(await checkIfAutoresponderIsSending()).toStrictEqual(false)

      vi.setSystemTime(new Date(day.date))

      for (let i = 0; i < numberOfCallsSimulatingCron; i++) {
        await sendAutoresponders()
      }

      vi.useRealTimers()

      const logs = await getAutoresponderLogs()
      expect(logs.length).toStrictEqual(day.totalAutorespondersSent)

      for (let i = 0; i < logs.length; i++) {
        expect(sendEmail).toHaveBeenNthCalledWith(
          i + 1,
          expect.objectContaining({ to: logs[i].email })
        )
      }

      expect(sendEmail).toHaveBeenCalledTimes(day.totalAutorespondersSent)
      expect(await checkIfAutoresponderIsSending()).toStrictEqual(false)
    }

    expect(console.error).not.toHaveBeenCalled()
    console.error = originalConsoleError

    expect(setAutoresponderSendingInProgress).toHaveBeenCalledTimes(
      days.length * numberOfCallsSimulatingCron
    )
    expect(setAutoresponderSendingIdle).toHaveBeenCalledTimes(
      days.length * numberOfCallsSimulatingCron
    )
  })
})
