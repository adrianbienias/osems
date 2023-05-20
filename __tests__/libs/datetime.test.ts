import { getLocalDateTime, wait } from "@/libs/datetime"
import { describe, expect, test, vi } from "vitest"

const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

describe("getLocalDateTime()", () => {
  test("should return date and time", async () => {
    expect(getLocalDateTime()).toMatch(dateTimeRegex)
  })
})

describe("wait()", () => {
  test("should wait", async () => {
    vi.stubGlobal("setTimeout", vi.fn())
    vi.useFakeTimers()

    vi.spyOn(global, "setTimeout")
    const waitFn = wait(1500)

    vi.runAllTimers()
    await waitFn

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1500)

    vi.useRealTimers()
    vi.unstubAllGlobals()
  })
})
