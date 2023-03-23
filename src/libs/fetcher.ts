export async function fetcher(input: RequestInfo, init?: RequestInit) {
  const url = input.toString()
  const urlSegments = url.split("/")

  if (urlSegments.includes("undefined")) {
    return null
  }

  const res = await fetch(input, init)

  return res.json()
}
