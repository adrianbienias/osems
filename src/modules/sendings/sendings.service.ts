import { config } from "@/app-config"
import nodemailer from "nodemailer"

async function createNodemailerTransporter() {
  let transporter

  if (config.isTest) {
    transporter = nodemailer.createTransport({ jsonTransport: true })
  } else {
    transporter = nodemailer.createTransport(config.smtp)
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
  text += getEmailFooter().text

  const from = config.sender
  const transporter = await createNodemailerTransporter()
  const searchParams = new URLSearchParams([
    ["subject", encodeURIComponent("Unsubscribe")],
    ["body", encodeURIComponent(to)],
  ])
  const unsubscribe = `${from}?${searchParams.toString()}`
  const data = { from, to, subject, text, html, list: { unsubscribe } }

  await transporter.sendMail(data)

  if (config.isTest) {
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
  const html = `\n<br/><br/>\n<p style="font-size: 11px; color: #919191; text-align: center;">Powered by <a style="color: #919191;" href="${link}">OSEMS</a></p>`
  const text = `\n\n\nPowered by OSEMS [${link}]`

  return { html, text }
}