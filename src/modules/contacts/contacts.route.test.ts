import { prisma } from "@/libs/prisma"
import { uuidRegex } from "@/libs/validators"
import { contactsGetHandler, contactsPostHandler } from "@/modules/contacts"
import { sendEmail } from "@/modules/sendings"
import { copyFileSync } from "fs"
import { createMocks } from "node-mocks-http"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { mockRequestResponse } from "../../../mocks/api-mocks"
import testData from "../../../mocks/test-data.json"
import { filterContacts } from "./contacts.model"
import { handleGetContacts } from "./contacts.route"

vi.mock("./contacts.model", async () => ({
  ...((await vi.importActual("./contacts.model")) as object),
  filterContacts: vi.fn().mockResolvedValue([{ dummy: "contact" }]),
}))
vi.mock("@/modules/sendings", () => ({ sendEmail: vi.fn() }))
vi.mock("@/modules/templates", () => {
  const templateMock = {
    subject: "Dummy subject",
    html: "<p>Dummy html content</p>",
    text: "Dummy text content",
  }

  return {
    getTemplate: vi.fn().mockResolvedValue(templateMock),
    parseTemplateVariables: vi.fn().mockReturnValue(templateMock),
  }
})

beforeEach(() => {
  copyFileSync("./prisma/empty-db.sqlite", "./prisma/test-db.sqlite")
})

describe("GET /api/v1/contacts", () => {
  test("should return contacts array", async () => {
    const { req, res } = mockRequestResponse({
      method: "GET",
      query: { listId: "dummy-list-id" },
    })

    await handleGetContacts({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      success: "Ok",
      contacts: [{ dummy: "contact" }],
    })
    expect(res._getStatusCode()).toStrictEqual(200)

    expect(filterContacts).toHaveBeenCalledWith({ listId: "dummy-list-id" })
  })
})

describe("POST /api/v1/public/contacts", () => {
  test("should return email validation error", async () => {
    const { req, res } = createMocks({ method: "POST" })

    await contactsPostHandler({ req, res })

    expect(res._getJSONData()).toStrictEqual({ error: "Missing list id" })
    expect(res._getStatusCode()).toStrictEqual(400)

    const contacts = await prisma.contact.findMany()
    expect(contacts.length).toStrictEqual(0)

    expect(sendEmail).not.toHaveBeenCalled()
  })

  test("should return list validation error", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { email: "foo@bar.baz" },
    })

    await contactsPostHandler({ req, res })
    const contacts = await prisma.contact.findMany()

    expect(res._getJSONData()).toStrictEqual({ error: "Missing list id" })
    expect(res._getStatusCode()).toStrictEqual(400)

    expect(contacts.length).toStrictEqual(0)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  test("should signup contact and initiate sending confirmation email", async () => {
    const createdList = await prisma.list.create({ data: testData.list })
    const { req, res } = createMocks({
      method: "POST",
      body: { email: "foo@bar.baz", listId: createdList.id },
    })

    expect(await prisma.contact.findMany()).toStrictEqual([])

    await contactsPostHandler({ req, res })

    expect(await prisma.contact.findMany()).toStrictEqual([
      {
        confirmedAt: null,
        createdAt: expect.any(Date),
        email: "foo@bar.baz",
        listId: expect.stringMatching(uuidRegex),
        unsubscribedAt: null,
      },
    ])
    expect(sendEmail).toHaveBeenCalledWith({
      to: "foo@bar.baz",
      subject: "Dummy subject",
      html: `<p>Dummy html content</p>`,
      text: `Dummy text content`,
    })

    expect(res._getRedirectUrl()).toStrictEqual(
      "http://example.com/redirect/signup"
    )
    expect(res._getStatusCode()).toStrictEqual(302)
  })
})

describe("GET /api/v1/public/contacts", () => {
  test("should return email validation error", async () => {
    const { req, res } = createMocks({
      method: "GET",
    })

    await contactsGetHandler({ req, res })

    expect(res._getRedirectUrl()).toStrictEqual(
      "http://localhost:3000/public/signup-form-error?error=Missing+email"
    )
    expect(res._getStatusCode()).toStrictEqual(302)
  })

  test("should return email validation error", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { email: "foo@bar.baz" },
    })

    await contactsGetHandler({ req, res })

    expect(res._getJSONData()).toStrictEqual({ error: "Missing list id" })
    expect(res._getStatusCode()).toStrictEqual(400)
  })

  test("should return action parameter validation error", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { email: "foo@bar.baz", listId: "this-id-does-not-matter-here" },
    })

    await contactsGetHandler({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      error: "Missing action parameter",
    })
    expect(res._getStatusCode()).toStrictEqual(400)
  })

  test("should return list validation error", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { email: "foo@bar.baz", action: "confirm" },
    })

    await contactsGetHandler({ req, res })

    expect(res._getJSONData()).toStrictEqual({ error: "Missing list id" })
    expect(res._getStatusCode()).toStrictEqual(400)
  })

  test("should return list validation error", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {
        email: "foo@bar.baz",
        action: "confirm",
        listId: "non-existing-id",
      },
    })

    await contactsGetHandler({ req, res })

    expect(res._getJSONData()).toStrictEqual({ error: "List does not exist" })
    expect(res._getStatusCode()).toStrictEqual(400)
  })

  test("should return contact validation error", async () => {
    const addedList = await prisma.list.create({ data: testData.list })
    const { req, res } = createMocks({
      method: "GET",
      query: { email: "foo@bar.baz", action: "confirm", listId: addedList.id },
    })

    await contactsGetHandler({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      error: "Contact does not exist on the list",
    })
    expect(res._getStatusCode()).toStrictEqual(400)
  })

  test("should confirm contact subscription", async () => {
    const addedList = await prisma.list.create({ data: testData.list })
    await prisma.contact.create({
      data: { email: "foo@bar.baz", listId: addedList.id },
    })
    const { req, res } = createMocks({
      method: "GET",
      query: { email: "foo@bar.baz", action: "confirm", listId: addedList.id },
    })

    expect(
      await prisma.contact.findUnique({
        where: { email_listId: { email: "foo@bar.baz", listId: addedList.id } },
      })
    ).toStrictEqual({
      listId: expect.stringMatching(uuidRegex),
      email: "foo@bar.baz",
      confirmedAt: null,
      unsubscribedAt: null,
      createdAt: expect.any(Date),
    })

    await contactsGetHandler({ req, res })

    expect(
      await prisma.contact.findUnique({
        where: { email_listId: { email: "foo@bar.baz", listId: addedList.id } },
      })
    ).toStrictEqual({
      listId: expect.stringMatching(uuidRegex),
      email: "foo@bar.baz",
      confirmedAt: expect.any(Date),
      unsubscribedAt: null,
      createdAt: expect.any(Date),
    })

    expect(res._getRedirectUrl()).toStrictEqual(
      "http://example.com/redirect/confirmation"
    )
    expect(res._getStatusCode()).toStrictEqual(302)
  })

  test("should confirm contact unsubscribe", async () => {
    const createdList = await prisma.list.create({ data: testData.list })
    await prisma.contact.create({
      data: { email: "foo@bar.baz", listId: createdList.id },
    })
    const { req, res } = createMocks({
      method: "GET",
      query: {
        email: "foo@bar.baz",
        action: "unsubscribe",
        listId: createdList.id,
      },
    })

    expect(
      await prisma.contact.findUnique({
        where: {
          email_listId: { email: "foo@bar.baz", listId: createdList.id },
        },
      })
    ).toStrictEqual({
      listId: expect.stringMatching(uuidRegex),
      email: "foo@bar.baz",
      confirmedAt: null,
      unsubscribedAt: null,
      createdAt: expect.any(Date),
    })

    await contactsGetHandler({ req, res })

    expect(
      await prisma.contact.findUnique({
        where: {
          email_listId: { email: "foo@bar.baz", listId: createdList.id },
        },
      })
    ).toStrictEqual({
      listId: expect.stringMatching(uuidRegex),
      email: "foo@bar.baz",
      confirmedAt: null,
      unsubscribedAt: expect.any(Date),
      createdAt: expect.any(Date),
    })

    expect(res._getRedirectUrl()).toStrictEqual(
      "http://example.com/redirect/unsubscribe"
    )
    expect(res._getStatusCode()).toStrictEqual(302)
  })
})
