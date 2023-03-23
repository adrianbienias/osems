import { sendEmail } from "@/modules/sendings"
import nodemailer from "nodemailer"
import { describe, expect, test, vi } from "vitest"

vi.mock("nodemailer", async () => ({
  default: {
    getTestMessageUrl: vi.fn(),
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn(),
    }),
  },
}))

const emailData = {
  from: "from-foo@bar.baz",
  to: "to-foo@bar.baz",
  subject: "Dummy subject",
  html: "<p>Dummy html message</p>",
  text: "Dummy text message",
}

describe("sendEmail()", () => {
  test("should call nodemailer sendMail() method", async () => {
    await sendEmail(emailData)

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      jsonTransport: true,
    })

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
      from: "from-foo@bar.baz",
      to: "to-foo@bar.baz",
      subject: "Dummy subject",
      html: `<p>Dummy html message</p>
<br/><br/>
<p style="font-size: 11px; color: #919191; text-align: center;">Powered by <a style="color: #919191;" href="https://osems.dev?ref=email">OSEMS</a></p>`,
      text: `Dummy text message


Powered by OSEMS [https://osems.dev?ref=email]`,
      list: {
        unsubscribe:
          "from-foo@bar.baz?subject=Unsubscribe&body=to-foo%2540bar.baz",
      },
    })
  })
})
