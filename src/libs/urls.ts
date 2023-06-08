import { appConfig } from "@/app-config"

export function createConfirmationUrl({
  email,
  listId,
}: {
  email: string
  listId: string
}) {
  const searchParams = new URLSearchParams([
    ["email", encodeURIComponent(email)],
    ["listId", listId],
    ["action", "confirm"],
  ])
  const confirmationUrl = `${
    appConfig.baseUrl
  }/api/v1/public/contacts?${searchParams.toString()}`

  return confirmationUrl
}

export function createUnsubscribeUrl({
  email,
  listId,
}: {
  email: string
  listId: string
}) {
  const searchParams = new URLSearchParams([
    ["email", encodeURIComponent(email)],
    ["listId", listId],
    ["action", "unsubscribe"],
  ])
  const unsubscribeUrl = `${
    appConfig.baseUrl
  }/api/v1/public/contacts?${searchParams.toString()}`

  return unsubscribeUrl
}
