import { deleteCookie, setCookie } from "cookies-next"
import { cleanTestDatabase } from "mocks/seed-db"
import { createMocks } from "node-mocks-http"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { setInitialAdminEmail } from "@/libs/installer"
import { sendEmail } from "@/modules/sendings"
import testData from "../../../mocks/test-data.json"
import { setToken } from "./auth.model"
import { handleDeleteAuth, handleGetAuth, handlePostAuth } from "./auth.route"

vi.mock("@/app-config", async () => {
  const actualModule =
    await vi.importActual<typeof import("@/app-config")>("@/app-config")
  const testData = await vi.importActual<
    typeof import("../../../mocks/test-data.json")
  >("../../../mocks/test-data.json")

  return {
    appConfig: {
      ...actualModule.appConfig,
      initialAdminEmail: "foo@bar.baz",
      jwtSecret: testData.jwt.secret,
    },
  }
})
vi.mock("cookies-next", () => ({
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}))
vi.mock("randomstring", async () => ({
  generate: vi.fn().mockReturnValue("dummy-token"),
}))
vi.mock("@/modules/sendings", () => ({ sendEmail: vi.fn() }))

beforeEach(() => {
  cleanTestDatabase()
})

describe("handlePostAuth()", () => {
  test("should return an error about missing privileges", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { email: "foo@bar.baz" },
    })

    await handlePostAuth({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      error: "Provided email doesn't have admin privileges",
    })
    expect(res._getStatusCode()).toStrictEqual(400)
  })

  test("should return an error about missing privileges", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { email: "foo@bar.baz" },
    })

    await setInitialAdminEmail()
    await handlePostAuth({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
    })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(sendEmail).toHaveBeenCalledWith({
      to: "foo@bar.baz",
      subject: "Confirm logging in",
      html: `<a href="http://localhost:3000/api/v1/public/auth?token=dummy-token">Click here to log in</a>`,
      text: `Click here to log in\n[http://localhost:3000/api/v1/public/auth?token=dummy-token]`,
      preheader: "Click the link in message",
    })
  })
})

describe("handleGetAuth()", () => {
  test("should redirect after passing valid token in query string", async () => {
    await setToken({ email: "foo@bar.baz", token: "dummy-token" })

    const { req, res } = createMocks({
      method: "GET",
      query: { token: "dummy-token" },
    })

    vi.useFakeTimers()
    vi.setSystemTime(new Date(testData.jwt.iat * 1000))

    await handleGetAuth({ req, res })

    vi.useRealTimers()

    // Login page handles another redirection if detects that user is logged in
    expect(res._getRedirectUrl()).toStrictEqual("/public/login")

    expect(setCookie).toHaveBeenCalledWith(
      "adminJWT",
      testData.jwt.token,
      expect.objectContaining({
        maxAge: 2678400,
      })
    )
  })
})

describe("handleDeleteAuth()", () => {
  test("should call deleteCookie() to log user out", async () => {
    const { req, res } = createMocks({ method: "DELETE" })

    await handleDeleteAuth({ req, res })

    expect(deleteCookie).toHaveBeenCalledWith(
      "adminJWT",
      expect.objectContaining({
        req: expect.any(Object),
        res: expect.any(Object),
      })
    )
  })
})
