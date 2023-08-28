import consoleStamp from "console-stamp"
import cron from "cron"
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

  new cron.CronJob(schedules.everyMinute, sendNewsletters, null, true)
  new cron.CronJob(schedules.everyMinute, sendAutoresponders, null, true)
}
