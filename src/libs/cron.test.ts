import consoleStamp from "console-stamp"
import cron from "cron"
import { describe, expect, test, vi } from "vitest"
import { sendAutoresponders } from "@/modules/autoresponders"
import { sendNewsletters } from "@/modules/newsletters"
import { startCronJobs } from "./cron"

vi.mock("cron", () => ({ default: { CronJob: vi.fn() } }))
vi.mock("console-stamp", () => ({ default: vi.fn() }))
vi.mock("@/modules/newsletters", () => ({ sendNewsletters: vi.fn() }))
vi.mock("@/modules/autoresponders", () => ({ sendAutoresponders: vi.fn() }))
vi.mock("@/app-config", () => ({ appConfig: { isProduction: true } }))

describe("cron", () => {
  test("should start cron jobs", async () => {
    startCronJobs()

    expect(consoleStamp).toHaveBeenCalled()

    expect(cron.CronJob).toHaveBeenNthCalledWith(
      1,
      "* * * * *",
      vi.mocked(sendNewsletters),
      null,
      true
    )
    expect(cron.CronJob).toHaveBeenNthCalledWith(
      2,
      "* * * * *",
      vi.mocked(sendAutoresponders),
      null,
      true
    )
  })
})
