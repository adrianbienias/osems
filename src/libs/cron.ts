import { config } from "@/app-config"
import { sendNewsletters } from "@/modules/newsletters"
import { schedule } from "node-cron"

console.info("\n✔ Node cron jobs activated\n")

const schedules = {
  everyDay: "0 0 * * *",
  everyHour: "0 * * * *",
  everyMinute: "* * * * *",
  everyTenSeconds: "*/10 * * * * *",
  everySecond: "* * * * * *",
}

schedule(
  config.isProduction ? schedules.everyTenSeconds : schedules.everySecond,
  async () => await sendNewsletters()
)
