export async function wait(milliseconds: number) {
  return await new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export function getLocalDateTime() {
  const now = new Date()
  const timezoneOffsetMin = now.getTimezoneOffset()
  const timezoneOffsetSec = timezoneOffsetMin * 60
  const timezoneOffsetMs = timezoneOffsetSec * 1000
  const currentTimestampMs = now.getTime()
  const adjustedDate = new Date(currentTimestampMs - timezoneOffsetMs)
  const formattedDate = adjustedDate.toISOString().substring(0, 16)

  return formattedDate
}
