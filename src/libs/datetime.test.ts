import { describe, expect, test, vi } from "vitest"
import { getLocalDateTime, wait } from "@/libs/datetime"

describe("getLocalDateTime()", () => {
  test("should return date and time", async () => {
    vi.setSystemTime(new Date("2000-01-01T00:00:00.000Z"))

    expect(getLocalDateTime()).toStrictEqual("2000-01-01T01:00")

    vi.useRealTimers()
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
