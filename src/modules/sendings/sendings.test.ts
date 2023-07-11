import { sendEmail } from "./sendings.service"
import nodemailer from "nodemailer"
import { describe, expect, test, vi } from "vitest"
import testData from "../../../mocks/test-data.json"

vi.mock("nodemailer", async () => ({
  default: {
    getTestMessageUrl: vi.fn(),
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn(),
    }),
  },
}))

describe("sendEmail()", () => {
  test("should call nodemailer sendMail() method", async () => {
    await sendEmail(testData.email)

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      jsonTransport: true,
    })

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
      from: "John Doe <email@example.com>",
      to: "to-foo@bar.baz",
      subject: "Dummy subject",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dummy subject</title>
  <style>
    h1 { font-size: 2rem; line-height: 1.25; }
    h2 { font-size: 1.5rem; line-height: 1.25; }
    h3 { font-size: 1.25rem; line-height: 1.25; }
    p { margin: 1rem 0; }
    code { background-color: #e2e8f0; padding: 0.125rem 0.25rem; border-radius: 0.375rem; }
    pre > code { background-color: transparent; padding: 0; border-radius: 0px; }

    @media (max-width: 600px) {
      body {
        padding: 0 !important;
      }
      #main-content {
        padding: 1rem !important;
        font-size: 1rem !important;
        line-height: 1.5rem !important;
      }
    }
  </style>
</head>
<body style="margin: 0; background-color: #f5f5f5; padding: 2rem;">
  <div id="main-content" style="background-color: white; max-width: 600px; padding: 2.5rem 3rem; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; font-size: 1.125rem; line-height: 1.75rem;">
<p>Dummy html message</p>
<br/>
<p style="font-size: 11px; color: #919191; text-align: center;">Powered by <a style="color: #919191;" href="https://osems.dev?ref=email">OSEMS</a></p>
  </div>
</body>
</html>`,
      text: `Dummy text message

Powered by OSEMS [https://osems.dev?ref=email]`,
      list: {
        unsubscribe:
          "email@example.com?subject=Unsubscribe&body=to-foo%2540bar.baz",
      },
    })
  })
})
