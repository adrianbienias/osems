import {
  handleGetList,
  handleGetLists,
  handlePatchList,
  handlePostList,
} from "@/modules/lists"
import apiListsHandler from "@/pages/api/v1/lists"
import apiListHandler from "@/pages/api/v1/lists/[listId]"
import { describe, expect, test, vi } from "vitest"
import { mockRequestResponse } from "../../../mocks/api-mocks"

vi.mock("@/modules/lists", () => ({
  handlePostList: vi.fn(),
  handleGetLists: vi.fn(),
  handleGetList: vi.fn(),
  handlePatchList: vi.fn(),
}))

describe("POST /api/v1/lists", () => {
  test("should call handlePostList()", async () => {
    const { req, res } = mockRequestResponse({
      method: "POST",
      body: { foo: "bar" },
    })
    await apiListsHandler(req, res)
    expect(handlePostList).toHaveBeenCalledWith({ req, res })
  })
})

describe("GET /api/v1/lists", () => {
  test("should call handleGetLists()", async () => {
    const { req, res } = mockRequestResponse({ method: "GET" })
    await apiListsHandler(req, res)
    expect(handleGetLists).toHaveBeenCalledWith({ req, res })
  })
})

describe("GET /api/v1/list/:listId", () => {
  test("should call handleGetList()", async () => {
    const { req, res } = mockRequestResponse({
      method: "GET",
      query: { foo: "bar" },
    })
    await apiListHandler(req, res)
    expect(handleGetList).toHaveBeenCalledWith({ req, res })
  })
})

describe("PATCH /api/v1/list/:listId", () => {
  test("should call updateList()", async () => {
    const { req, res } = mockRequestResponse({
      method: "PATCH",
      query: { foo: "bar" },
      body: { foo: "bar" },
    })
    await apiListHandler(req, res)
    expect(handlePatchList).toHaveBeenCalledWith({ req, res })
  })
})

describe("DELETE /api/v1/lists", () => {
  test("should return an error message for not allowed method", async () => {
    const { req, res } = mockRequestResponse({ method: "DELETE" })
    await apiListsHandler(req, res)
    expect(res._getJSONData()).toStrictEqual({ error: "Method not allowed" })
    expect(res._getStatusCode()).toStrictEqual(405)
  })
})
