import consoleStamp from "console-stamp"
import { schedule } from "node-cron"
import { describe, expect, test, vi } from "vitest"
import { startCronJobs } from "./cron"

vi.mock("node-cron", () => ({ schedule: vi.fn() }))
vi.mock("console-stamp", () => ({ default: vi.fn() }))
vi.mock("@/modules/newsletters", () => ({ sendNewsletters: vi.fn() }))
vi.mock("@/app-config", () => ({ appConfig: { isProduction: true } }))

describe("cron", () => {
  test("should start cron jobs", async () => {
    startCronJobs()
    const cronSchedule = "*/15 * * * * *"
    const sendNewsletters = vi.mocked(schedule).mock.calls[0][1]
    const sendAutoresponders = vi.mocked(schedule).mock.calls[1][1]

    expect(consoleStamp).toHaveBeenCalled()

    expect(schedule).toHaveBeenCalledWith(cronSchedule, sendNewsletters)
    expect(schedule).toHaveBeenCalledWith(cronSchedule, sendAutoresponders)
    expect(sendNewsletters.toString()).toStrictEqual(
      "async () => await __vite_ssr_import_1__.sendNewsletters()"
    )
    expect(sendAutoresponders.toString()).toStrictEqual(
      "async () => await __vite_ssr_import_0__.sendAutoresponders()"
    )
  })
})
