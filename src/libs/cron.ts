import consoleStamp from "console-stamp"
import { schedule } from "node-cron"
import { sendAutoresponders } from "@/modules/autoresponders"
import { sendNewsletters } from "@/modules/newsletters"

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

  schedule(schedules.everyMinute, async () => await sendNewsletters())
  schedule(schedules.everyMinute, async () => await sendAutoresponders())
}
