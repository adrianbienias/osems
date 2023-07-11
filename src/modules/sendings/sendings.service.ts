import { appConfig } from "@/app-config"
import nodemailer from "nodemailer"

async function createNodemailerTransporter() {
  let transporter

  if (appConfig.isTest) {
    transporter = nodemailer.createTransport({ jsonTransport: true })
  } else {
    transporter = nodemailer.createTransport(appConfig.smtp)
  }

  if (!transporter) {
    throw new Error("Undefined nodemailer transporter")
  }

  return transporter
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}) {
  html += getEmailFooter().html
  html = wrapHtmlTemplate({ subject, html })
  text += getEmailFooter().text

  const from = appConfig.sender
  const fromEmail = from.match(/<(?<email>.+)>/)?.groups?.email || from
  const transporter = await createNodemailerTransporter()
  const searchParams = new URLSearchParams([
    ["subject", encodeURIComponent("Unsubscribe")],
    ["body", encodeURIComponent(to)],
  ])
  const unsubscribe = `${fromEmail}?${searchParams.toString()}`
  const data = { from, to, subject, text, html, list: { unsubscribe } }

  await transporter.sendMail(data)

  if (appConfig.isTest) {
    const message = { from, to, subject, html, text }
    console.info(`Simulated email send`, message)
  }
}

/**
 * Kindly, please don't remove the email footer.
 * It helps spread this open source software over the world.
 * Thank you! ❤️
 */
function getEmailFooter() {
  const link = "https://osems.dev?ref=email"
  const html = `\n<br/>\n<p style="font-size: 11px; color: #919191; text-align: center;">Powered by <a style="color: #919191;" href="${link}">OSEMS</a></p>`
  const text = `\n\nPowered by OSEMS [${link}]`

  return { html, text }
}

export function wrapHtmlTemplate({
  subject,
  html,
}: {
  subject: string
  html: string
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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
        line-height: 1.5rem !important;
      }
    }
  </style>
</head>
<body style="margin: 0; background-color: #f5f5f5;">
  <div id="main-content" style="background-color: white; max-width: 600px; padding: 2.5rem 3rem; margin: 2rem auto; font-family: Arial, Helvetica, sans-serif; font-size: 1.125rem; line-height: 1.75rem;">
${html}
  </div>
</body>
</html>`
}
