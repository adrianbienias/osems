import { schedule } from "node-cron"
import { sendNewsletters } from "@/modules/newsletters"

console.info("✔ Node cron jobs activated")

if (!process.env.NODE_ENV) {
  throw new Error("Undefined NODE_ENV")
}

const schedules = {
  everyDay: "0 0 * * *",
  everyHour: "0 * * * *",
  everyMinute: "* * * * *",
  everyTenSeconds: "*/10 * * * * *",
  everySecond: "* * * * * *",
}

schedule(
  process.env.NODE_ENV === "production"
    ? schedules.everyTenSeconds
    : schedules.everySecond,
  async () => await sendNewsletters()
)
