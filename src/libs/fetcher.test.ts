import { describe, expect, test, vi } from "vitest"
import { fetcher } from "./fetcher"

describe("fetcher()", () => {
  test("should call fetch function with passed arguments", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => ({ json: vi.fn() }))
    )

    await fetcher("http://localhost:3000")
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000", undefined)

    const request = new Request("http://localhost")
    await fetcher("http://localhost:3000", request)
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000", request)
  })
})
