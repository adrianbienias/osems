import { sendEmail } from "@/modules/sendings"
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
      html: `<p>Dummy html message</p>
<br/><br/>
<p style="font-size: 11px; color: #919191; text-align: center;">Powered by <a style="color: #919191;" href="https://osems.dev?ref=email">OSEMS</a></p>`,
      text: `Dummy text message


Powered by OSEMS [https://osems.dev?ref=email]`,
      list: {
        unsubscribe:
          "John Doe <email@example.com>?subject=Unsubscribe&body=to-foo%2540bar.baz",
      },
    })
  })
})
