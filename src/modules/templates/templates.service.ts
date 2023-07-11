import { htmlToText } from "html-to-text"

export function convertTemplateHtmlToText(html: string): string {
  return htmlToText(html, {
    whitespaceCharacters: " \t\r\n\f\u200b\u200c\u00a0",
    selectors: [{ selector: "#preheader", format: "skip" }],
  })
}

export function parseTemplateVariables({
  message,
  messageVariables,
}: {
  message: {
    subject: string
    preheader: string
    html: string
    text: string
  }
  messageVariables: Map<string, string>
}) {
  const parsedTemplate = { ...message }

  for (const templateItemKey of Object.keys(parsedTemplate)) {
    const key = templateItemKey as keyof typeof parsedTemplate
    const item = parsedTemplate[key]

    for (const [variableKey, variableValue] of messageVariables) {
      parsedTemplate[key] = item.replaceAll(variableKey, variableValue)
    }
  }

  return parsedTemplate
}
