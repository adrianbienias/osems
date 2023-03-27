import { addList, getList, getLists, updateList } from "@/modules/lists"
import { getTemplate } from "@/modules/templates"
import apiListsHandler from "@/pages/api/v1/lists/"
import apiListHandler from "@/pages/api/v1/lists/[listId]"
import { describe, expect, test, vi } from "vitest"
import { mockRequestResponse } from "./../api-mocks"

vi.mock("@/modules/lists", () => {
  const mockedList = { name: "Dummy mocked list" }

  return {
    addList: vi.fn().mockResolvedValue(mockedList),
    getList: vi.fn().mockResolvedValue(mockedList),
    updateList: vi.fn().mockResolvedValue(mockedList),
    getLists: vi.fn().mockResolvedValue([mockedList, mockedList]),
  }
})

vi.mock("@/modules/templates", () => {
  return {
    addTemplate: vi
      .fn()
      .mockResolvedValue({ id: "dummy-confirmation-template-id" }),
    getTemplate: vi.fn(),
    updateTemplate: vi.fn(),
  }
})

describe("/api/lists", () => {
  test("should return an error message for not allowed method", async () => {
    const { req, res } = mockRequestResponse({ method: "DELETE" })

    await apiListsHandler(req, res)

    expect(res._getJSONData()).toStrictEqual({ error: "Method not allowed" })
    expect(res._getStatusCode()).toStrictEqual(405)
  })

  test("should return an error message for missing list name", async () => {
    const { req, res } = mockRequestResponse({ method: "POST" })

    await apiListsHandler(req, res)

    expect(res._getJSONData()).toStrictEqual({ error: "Missing list name" })
    expect(res._getStatusCode()).toStrictEqual(400)

    expect(addList).not.toHaveBeenCalled()
  })

  test("should return an error message for missing next field", async () => {
    const { req, res } = mockRequestResponse({
      method: "POST",
      body: { name: "Dummy list name" },
    })

    await apiListsHandler(req, res)

    expect(res._getJSONData()).toStrictEqual({
      error: "Missing signup redirect url",
    })
    expect(res._getStatusCode()).toStrictEqual(400)

    expect(addList).not.toHaveBeenCalled()
  })

  test("should call addList()", async () => {
    const { req, res } = mockRequestResponse({
      method: "POST",
      body: {
        name: "Foo Bar List",
        signupRedirectUrl: "http://signupRedirectUrl",
        confirmationRedirectUrl: "http://confirmationRedirectUrl",
        unsubscribeRedirectUrl: "http://unsubscribeRedirectUrl",
        subject: "Dummy subject",
        html: `<p>Foo bar content</p><a href="{{confirmation}}">Confirm</a>`,
      },
    })

    await apiListsHandler(req, res)

    expect(res._getJSONData()).toStrictEqual({
      success: "List added",
      list: { name: "Dummy mocked list" },
    })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(addList).toHaveBeenCalledWith({
      name: "Foo Bar List",
      signupRedirectUrl: "http://signupRedirectUrl",
      confirmationRedirectUrl: "http://confirmationRedirectUrl",
      unsubscribeRedirectUrl: "http://unsubscribeRedirectUrl",
      confirmationTemplateId: "dummy-confirmation-template-id",
    })
  })

  test("should call getLists()", async () => {
    const { req, res } = mockRequestResponse({ method: "GET" })

    await apiListsHandler(req, res)

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      lists: [{ name: "Dummy mocked list" }, { name: "Dummy mocked list" }],
    })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(getLists).toHaveBeenCalled()
  })
})

describe("/api/list/:listId", () => {
  test("should call getList()", async () => {
    const { req, res } = mockRequestResponse({
      method: "GET",
      query: {
        listId: "dummy-list-id",
      },
    })

    await apiListHandler(req, res)

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      list: { name: "Dummy mocked list" },
    })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(getList).toHaveBeenCalled()
    expect(getTemplate).toHaveBeenCalled()
    expect(getLists).not.toHaveBeenCalled()
  })

  test("should call updateList()", async () => {
    const { req, res } = mockRequestResponse({
      method: "PATCH",
      query: {
        listId: "dummy-list-id",
      },
      body: {
        name: "Changed name",
        html: `<p>Foo bar content</p><a href="{{confirmation}}">Confirm</a>`,
      },
    })

    await apiListHandler(req, res)

    expect(res._getJSONData()).toStrictEqual({
      success: "List updated",
      list: {
        name: "Dummy mocked list",
      },
    })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(updateList).toHaveBeenCalledWith({
      id: "dummy-list-id",
      name: "Changed name",
    })
  })
})
