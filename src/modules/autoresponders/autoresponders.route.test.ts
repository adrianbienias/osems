import {
  addAutoresponder,
  filterAutoresponders,
  getAutoresponder,
  updateAutoresponder,
} from "@/modules/autoresponders/autoresponders.model"
import {
  handleGetAutoresponder,
  handleGetAutoresponders,
  handlePatchAutoresponder,
  handlePostAutoresponders,
} from "@/modules/autoresponders/autoresponders.route"
import { copyFileSync } from "fs"
import { createMocks } from "node-mocks-http"
import { beforeEach, describe, expect, test, vi } from "vitest"

vi.mock("@/modules/autoresponders/autoresponders.model", () => {
  const mockedAutoresponders = [
    { id: "dummy-autoresponder-id-1" },
    { id: "dummy-autoresponder-id-2" },
  ]

  return {
    addAutoresponder: vi.fn().mockResolvedValue({ foo: "bar" }),
    filterAutoresponders: vi
      .fn()
      .mockResolvedValue(
        mockedAutoresponders.map((item) => ({ ...item, template: {} }))
      ),
    getAutoresponder: vi.fn().mockResolvedValue(mockedAutoresponders[0]),
    updateAutoresponder: vi.fn().mockResolvedValue(mockedAutoresponders[0]),
  }
})
vi.mock("@/modules/templates", () => ({
  getTemplate: vi.fn().mockResolvedValue({}),
  updateTemplate: vi.fn(),
}))

beforeEach(() => {
  copyFileSync("./prisma/empty-db.sqlite", "./prisma/test-db.sqlite")
})

describe("handlePostAutoresponders()", () => {
  test("should return error for missing list id", async () => {
    const { req, res } = createMocks({
      method: "POST",
    })

    await handlePostAutoresponders({ req, res })

    expect(res._getJSONData()).toStrictEqual({ error: "Missing list id" })
    expect(res._getStatusCode()).toStrictEqual(400)
    expect(addAutoresponder).not.toHaveBeenCalled()
  })

  test("should return error for missing delay days", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        listId: "dummy-list-id",
      },
    })

    await handlePostAutoresponders({ req, res })

    expect(res._getJSONData()).toStrictEqual({ error: "Missing delay days" })
    expect(res._getStatusCode()).toStrictEqual(400)
    expect(addAutoresponder).not.toHaveBeenCalled()
  })

  test("should return error for missing template subject", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        listId: "dummy-list-id",
        delayDays: "5",
      },
    })

    await handlePostAutoresponders({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      error: "Missing subject",
    })
    expect(res._getStatusCode()).toStrictEqual(400)
    expect(addAutoresponder).not.toHaveBeenCalled()
  })

  test("should return error for missing template html content", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        listId: "dummy-list-id",
        delayDays: "5",
        subject: "Dummy autoresponder subject",
      },
    })

    await handlePostAutoresponders({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      error: "Missing html content",
    })
    expect(res._getStatusCode()).toStrictEqual(400)
    expect(addAutoresponder).not.toHaveBeenCalled()
  })

  test("should call addAutoresponder() with sent values", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        listId: "dummy-list-id",
        delayDays: "5",
        subject: "Dummy autoresponder subject",
        html: `<p>Dummy autoresponder content</p><p><a href="{{unsubscribe}}">Unsubscribe</a></p>`,
      },
    })

    await handlePostAutoresponders({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      autoresponder: { foo: "bar" },
    })
    expect(res._getStatusCode()).toStrictEqual(200)
    expect(addAutoresponder).toHaveBeenCalledWith({
      listId: "dummy-list-id",
      delayDays: 5,
      autoresponderTemplate: {
        subject: "Dummy autoresponder subject",
        html: `<p>Dummy autoresponder content</p><p><a href="{{unsubscribe}}">Unsubscribe</a></p>`,
      },
    })
  })
})

describe("handleGetAutoresponders()", () => {
  test("should return autoresponders array", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {
        listId: "dummy-autoresponder-id",
      },
    })

    await handleGetAutoresponders({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      autoresponders: expect.any(Array),
    })
    expect(res._getJSONData().autoresponders.length).toStrictEqual(2)
    expect(res._getStatusCode()).toStrictEqual(200)
    expect(filterAutoresponders).toHaveBeenCalledWith({
      listId: "dummy-autoresponder-id",
    })
  })
})

describe("handleGetAutoresponder()", () => {
  test("should return autoresponders array", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { autoresponderId: "dummy-autoresponder-id" },
    })

    await handleGetAutoresponder({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      autoresponder: {
        id: "dummy-autoresponder-id-1",
      },
      template: {},
    })
    expect(res._getStatusCode()).toStrictEqual(200)
    expect(getAutoresponder).toHaveBeenCalledWith({
      id: "dummy-autoresponder-id",
    })
  })
})

describe("handlePatchAutoresponder()", () => {
  test("should return updated autoresponder", async () => {
    const { req, res } = createMocks({
      method: "PATCH",
      query: { autoresponderId: "dummy-autoresponder-id" },
      body: {
        listId: "dummy-list-id",
        delayDays: 123,
        subject: "dummy-subject",
        html: "<p>dummy-html</p>",
      },
    })

    await handlePatchAutoresponder({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      autoresponder: {
        id: "dummy-autoresponder-id-1",
      },
    })
    expect(res._getStatusCode()).toStrictEqual(200)
    expect(updateAutoresponder).toHaveBeenCalledWith({
      id: "dummy-autoresponder-id",
      listId: "dummy-list-id",
      delayDays: 123,
    })
  })
})
