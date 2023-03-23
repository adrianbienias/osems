import { prisma } from "@/libs/prisma"
import {
  addTemplate,
  convertTemplateHtmlToText,
  getTemplate,
  getTemplates,
  parseTemplateVariables,
  updateTemplate,
} from "@/modules/templates"
import { beforeEach, describe, expect, test } from "vitest"
import { cleanDatabase } from "../../before-each"

const uuidRegex = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/

beforeEach(async () => {
  await cleanDatabase()
})

describe("addTemplate()", () => {
  test("should trigger HTML validation error", async () => {
    const template = await addTemplate({
      subject: "Dummy template",
      html: "<p>Dummy content of the email template",
    })

    expect(template).toStrictEqual(
      Error("Invalid HTML markup in email template")
    )
  })

  test("should add a new template", async () => {
    expect(await prisma.template.findMany()).toStrictEqual([])

    await addTemplate({
      subject: "Dummy template",
      html: "<p>Dummy content of the email template</p>",
    })

    expect(await prisma.template.findMany()).toStrictEqual([
      {
        id: expect.stringMatching(uuidRegex),
        subject: "Dummy template",
        html: "<p>Dummy content of the email template</p>",
        text: "Dummy content of the email template",
        createdAt: expect.any(Date),
      },
    ])
  })
})

describe("getTemplates()", () => {
  test("should get multiple templates", async () => {
    await addTemplate({
      subject: "Dummy template #1",
      html: "Dummy content of the email template #1",
    })
    await addTemplate({
      subject: "Dummy template #2",
      html: "Dummy content of the email template #2",
    })
    await addTemplate({
      subject: "Dummy template #3",
      html: "Dummy content of the email template #3",
    })

    expect(await getTemplates()).toStrictEqual([
      {
        id: expect.stringMatching(uuidRegex),
        subject: "Dummy template #1",
        html: "Dummy content of the email template #1",
        text: "Dummy content of the email template #1",
        createdAt: expect.any(Date),
      },
      {
        id: expect.stringMatching(uuidRegex),
        subject: "Dummy template #2",
        html: "Dummy content of the email template #2",
        text: "Dummy content of the email template #2",
        createdAt: expect.any(Date),
      },
      {
        id: expect.stringMatching(uuidRegex),
        subject: "Dummy template #3",
        html: "Dummy content of the email template #3",
        text: "Dummy content of the email template #3",
        createdAt: expect.any(Date),
      },
    ])
  })
})

describe("updateTemplate()", () => {
  test("should update template", async () => {
    const template = await addTemplate({
      subject: "Dummy template",
      html: "<p>Dummy content of the email template</p>",
    })
    if (template instanceof Error) {
      return expect(template).not.toBeInstanceOf(Error)
    }

    expect(await getTemplate({ id: template.id })).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      subject: "Dummy template",
      html: "<p>Dummy content of the email template</p>",
      text: "Dummy content of the email template",
      createdAt: expect.any(Date),
    })

    await updateTemplate({
      confirmationTemplateId: template.id,
      subject: "Updated template",
      html: "<p>Updated content of the email template</p>",
    })

    expect(await getTemplate({ id: template.id })).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      subject: "Updated template",
      html: "<p>Updated content of the email template</p>",
      text: "Updated content of the email template",
      createdAt: expect.any(Date),
    })
  })
})

describe("getTemplate()", () => {
  test("should get a template by its id", async () => {
    const template = await addTemplate({
      subject: "Dummy template",
      html: "Dummy content of the email template",
    })
    if (template instanceof Error) {
      return expect(template).not.toBeInstanceOf(Error)
    }

    expect(await getTemplate({ id: template.id })).toStrictEqual({
      id: expect.stringMatching(uuidRegex),
      subject: "Dummy template",
      html: "Dummy content of the email template",
      text: "Dummy content of the email template",
      createdAt: expect.any(Date),
    })
  })
})

describe("convertTemplateHtmlToText()", () => {
  test("should convert HTML template to text version", async () => {
    const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email subject</title>
  <style>
    h1 { font-size: 2rem; line-height: 1.25; }
    h2 { font-size: 1.5rem; line-height: 1.25; }
    h3 { font-size: 1.25rem; line-height: 1.25; }
    p { margin: 1rem 0; }
    code { background-color: #e2e8f0; padding: 0.125rem 0.25rem; border-radius: 0.375rem; }
    pre > code { background-color: transparent; padding: 0; border-radius: 0px; }

    @media (max-width: 600px) {
      #main-content {
        padding: 1rem !important;
        font-size: 1rem !important;
      }
    }
  </style>
</head>
<body style="margin: 0; background-color: #f5f5f5;">
  <span id="preheader">Preheader text &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</span>

  <div id="main-content" style="background-color: white; max-width: 600px; padding: 2.5rem 3rem; margin: 2rem auto; font-family: Arial, Helvetica, sans-serif; font-size: 1.125rem; line-height: 1.75rem;">
    <p>Dummy content</p>
  </div>

  <div>
    <p>Another dummy piece of content</p>
  </div>
</body>
</html>
`

    const expectedText = `Dummy content

Another dummy piece of content`
    expect(convertTemplateHtmlToText(html)).toStrictEqual(expectedText)
  })
})

describe("parseTemplateVariables()", () => {
  test("should replace template variables with dynamic content", async () => {
    const message = {
      subject: "Subject with {{variable}}",
      html: "<p>Message with {{variable}} that appears twice, {{variable}}.</p>",
      text: "Message with {{variable}} that appears twice, {{variable}}.",
    }
    const messageVariables = new Map([["{{variable}}", "dynamic content"]])
    const expectedOutput = {
      subject: "Subject with dynamic content",
      html: "<p>Message with dynamic content that appears twice, dynamic content.</p>",
      text: "Message with dynamic content that appears twice, dynamic content.",
    }

    expect(parseTemplateVariables({ message, messageVariables })).toStrictEqual(
      expectedOutput
    )
  })
})
