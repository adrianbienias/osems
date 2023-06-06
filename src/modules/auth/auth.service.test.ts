import { describe, expect, test, vi } from "vitest"
import testData from "../../../mocks/test-data.json"
import { signAdminJwt, verifyJwt } from "./auth.service"

vi.mock("@/app-config", async () => {
  const testData = await vi.importActual<
    typeof import("../../../mocks/test-data.json")
  >("../../../mocks/test-data.json")

  return {
    config: { jwtSecret: testData.jwt.secret },
  }
})

describe("signAdminJwt()", () => {
  test("should generate signed admin JWT", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(testData.jwt.iat * 1000))

    expect(await signAdminJwt(testData.jwt.payload)).toStrictEqual(
      testData.jwt.token
    )

    vi.useRealTimers()
  })
})

describe("verifyJwt()", () => {
  test("should verify signed JWT", async () => {
    expect(await verifyJwt(testData.jwt.token)).toStrictEqual({
      ...testData.jwt.payload,
      iat: testData.jwt.iat,
    })
  })
})
