export async function wait(milliseconds: number) {
  return await new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export function getLocalDateTime(date: Date = new Date()) {
  const initDate = new Date(date)
  const timezoneOffsetMin = initDate.getTimezoneOffset()
  const timezoneOffsetSec = timezoneOffsetMin * 60
  const timezoneOffsetMs = timezoneOffsetSec * 1000
  const currentTimestampMs = initDate.getTime()
  const adjustedDate = new Date(currentTimestampMs - timezoneOffsetMs)
  const formattedDate = adjustedDate.toISOString().substring(0, 16)

  return formattedDate
}
