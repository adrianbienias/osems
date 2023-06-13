import { appConfig } from "@/app-config"
import { sendAutoresponders } from "@/modules/autoresponders"
import { sendNewsletters } from "@/modules/newsletters"
import consoleStamp from "console-stamp"
import { schedule } from "node-cron"

const schedules = {
  everyDay: "0 0 * * *",
  everyHour: "0 * * * *",
  everyMinute: "* * * * *",
  everyFifteenSeconds: "*/15 * * * * *",
  everyTenSeconds: "*/10 * * * * *",
  everySecond: "* * * * * *",
}

export function startCronJobs() {
  consoleStamp(console, { format: ":date(yyyy-mm-dd HH:MM:ss) :label" })
  console.info("\n✔ Node cron jobs activated\n")

  schedule(schedules.everyFifteenSeconds, async () => await sendNewsletters())

  schedule(
    schedules.everyFifteenSeconds,
    async () => await sendAutoresponders()
  )
}
