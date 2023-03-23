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
    process.env.NEXT_PUBLIC_BASE_URL
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
    process.env.NEXT_PUBLIC_BASE_URL
  }/api/v1/public/contacts?${searchParams.toString()}`

  return unsubscribeUrl
}
