import { cleanTestDatabase, seedTestDatabase } from "mocks/seed-db"
import { createMocks } from "node-mocks-http"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { uuidRegex } from "@/libs/validators"
import { sendEmail } from "@/modules/sendings"
import { mockRequestResponse } from "../../../mocks/api-mocks"
import { filterContacts, getAllContacts, getContact } from "./contacts.model"
import {
  contactsGetHandler,
  contactsPostHandler,
  handleGetContacts,
} from "./contacts.route"

vi.mock("./contacts.model", async () => {
  const actualModule =
    await vi.importActual<typeof import("./contacts.model")>("./contacts.model")

  return {
    ...actualModule,
    filterContacts: vi.fn().mockResolvedValue([{ dummy: "contact" }]),
  }
})
vi.mock("@/modules/sendings", () => ({ sendEmail: vi.fn() }))
vi.mock("@/modules/templates", async () => {
  const actualModule = await vi.importActual<
    typeof import("@/modules/templates")
  >("@/modules/templates")
  const testData = await vi.importActual<
    typeof import("../../../mocks/test-data.json")
  >("../../../mocks/test-data.json")

  return {
    ...actualModule,
    getTemplate: vi.fn().mockResolvedValue(testData.confirmationTemplate),
  }
})

beforeEach(() => {
  cleanTestDatabase()
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

    expect((await getAllContacts()).length).toStrictEqual(0)

    expect(sendEmail).not.toHaveBeenCalled()
  })

  test("should return list validation error", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { email: "foo@bar.baz" },
    })

    await contactsPostHandler({ req, res })

    expect(res._getJSONData()).toStrictEqual({ error: "Missing list id" })
    expect(res._getStatusCode()).toStrictEqual(400)

    expect((await getAllContacts()).length).toStrictEqual(0)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  test("should signup contact and initiate sending confirmation email", async () => {
    seedTestDatabase()

    const listId = "2e4b0581-0bdc-4a54-bc05-8877b8808a40"
    const email = "foo@bar.baz"

    const { req, res } = createMocks({
      method: "POST",
      body: { email, listId },
    })

    expect(await getContact({ listId, email })).toStrictEqual(null)

    await contactsPostHandler({ req, res })

    expect(await getContact({ listId, email })).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      confirmedAt: null,
      createdAt: expect.any(Date),
      email,
      listId,
      unsubscribedAt: null,
    })
    expect(sendEmail).toHaveBeenCalledWith({
      to: email,
      subject: "Foo subject",
      preheader: "Foo preheader",
      html: '<p>Foo <a href="http://localhost:3000/api/v1/public/contacts?email=foo%2540bar.baz&listId=2e4b0581-0bdc-4a54-bc05-8877b8808a40&action=confirm">Confirmation</a></p>',
      text: "Foo Confirmation [http://localhost:3000/api/v1/public/contacts?email=foo%2540bar.baz&listId=2e4b0581-0bdc-4a54-bc05-8877b8808a40&action=confirm]",
    })

    expect(res._getRedirectUrl()).toStrictEqual(
      "http://example.com/redirect/signup"
    )
    expect(res._getStatusCode()).toStrictEqual(302)
  })
})

describe("GET /api/v1/public/contacts", () => {
  test("should return email validation error", async () => {
    const { req, res } = createMocks({ method: "GET" })

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
    seedTestDatabase()

    const listId = "2e4b0581-0bdc-4a54-bc05-8877b8808a40"
    const email = "foo@bar.baz"

    const { req, res } = createMocks({
      method: "GET",
      query: { action: "confirm", email, listId },
    })

    await contactsGetHandler({ req, res })

    expect(res._getJSONData()).toStrictEqual({
      error: "Contact does not exist on the list",
    })
    expect(res._getStatusCode()).toStrictEqual(400)
  })

  test("should confirm contact subscription", async () => {
    seedTestDatabase()

    const listId = "2e4b0581-0bdc-4a54-bc05-8877b8808a40"
    const email = "marvin.johns@hotmail.com"

    expect(await getContact({ email, listId })).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      listId,
      email,
      confirmedAt: null,
      unsubscribedAt: null,
      createdAt: expect.any(Date),
    })

    const { req, res } = createMocks({
      method: "GET",
      query: { action: "confirm", email, listId },
    })

    await contactsGetHandler({ req, res })

    expect(await getContact({ email, listId })).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      listId,
      email,
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
    seedTestDatabase()

    const listId = "2e4b0581-0bdc-4a54-bc05-8877b8808a40"
    const email = "milo_schiller@yahoo.com"

    const { req, res } = createMocks({
      method: "GET",
      query: { action: "unsubscribe", email, listId },
    })

    expect(await getContact({ email, listId })).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      listId,
      email,
      confirmedAt: expect.any(Date),
      unsubscribedAt: null,
      createdAt: expect.any(Date),
    })

    await contactsGetHandler({ req, res })

    expect(await getContact({ email, listId })).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      listId,
      email,
      confirmedAt: expect.any(Date),
      unsubscribedAt: expect.any(Date),
      createdAt: expect.any(Date),
    })

    expect(res._getRedirectUrl()).toStrictEqual(
      "http://example.com/redirect/unsubscribe"
    )
    expect(res._getStatusCode()).toStrictEqual(302)
  })
})
