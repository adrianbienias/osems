import { appConfig } from "@/app-config"
import { sendAutoresponders } from "@/modules/autoresponders"
import { sendNewsletters } from "@/modules/newsletters"
import consoleStamp from "console-stamp"
import { schedule } from "node-cron"

consoleStamp(console, { format: ":date(yyyy-mm-dd HH:MM:ss) :label" })
console.info("\n✔ Node cron jobs activated\n")

const schedules = {
  everyDay: "0 0 * * *",
  everyHour: "0 * * * *",
  everyMinute: "* * * * *",
  everyTenSeconds: "*/10 * * * * *",
  everySecond: "* * * * * *",
}

schedule(
  appConfig.isProduction ? schedules.everyTenSeconds : schedules.everySecond,
  async () => await sendNewsletters()
)

schedule(
  appConfig.isProduction ? schedules.everyTenSeconds : schedules.everySecond,
  async () => await sendAutoresponders()
)
