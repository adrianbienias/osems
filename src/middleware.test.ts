import { NextRequest } from "next/server"
import { describe, expect, test, vi } from "vitest"
import testData from "../mocks/test-data.json"
import { config, middleware } from "./middleware"

vi.mock("@/app-config", async () => {
  const actualModule =
    await vi.importActual<typeof import("@/app-config")>("@/app-config")
  const testData = await vi.importActual<
    typeof import("../mocks/test-data.json")
  >("../mocks/test-data.json")

  return {
    appConfig: {
      ...actualModule.appConfig,
      jwtSecret: testData.jwt.secret,
      isProduction: true,
    },
  }
})

describe("middleware()", () => {
  test("should redirect to login page if there's no adminJWT in cookie", async () => {
    const req = new NextRequest("http://localhost:3000")

    const res = await middleware(req)

    expect(res?.status).toStrictEqual(307)
    expect(res?.cookies.get("adminJWT")).toStrictEqual(undefined)
    expect(res?.headers.get("location")).toStrictEqual(
      "http://localhost:3000/public/login"
    )
  })

  test("should redirect to login page if adminJWT in cookie is malformed", async () => {
    const req = new NextRequest("http://localhost:3000")
    req.cookies.set("adminJWT", "malformed-token")

    const originalConsoleError = console.error
    vi.spyOn(console, "error").mockImplementation(() => vi.fn())

    const res = await middleware(req)

    expect(console.error).toHaveBeenCalledWith(Error("Invalid Compact JWS"))
    console.error = originalConsoleError

    expect(res?.status).toStrictEqual(307)
    expect(res?.headers.get("location")).toStrictEqual(
      "http://localhost:3000/public/login"
    )
  })

  test("should pass the request if there's valid adminJWT in cookie", async () => {
    const req = new NextRequest("http://localhost:3000")
    req.cookies.set("adminJWT", testData.jwt.token)

    const res = await middleware(req)

    expect(res?.cookies.get("adminJWT")).toStrictEqual({
      name: "adminJWT",
      value: testData.jwt.token,
      maxAge: 2678400,
      expires: expect.any(Date),
      path: "/",
    })
    expect(res?.status).toStrictEqual(200)
    expect(res?.headers.get("location")).toStrictEqual(null)
  })
})

describe("config", () => {
  test("should exclude public paths from middleware", () => {
    expect(config).toStrictEqual({
      matcher: ["/((?!_next|api/v1/public|public).*)"],
    })
  })
})
