import { htmlToText } from "html-to-text"

export function convertTemplateHtmlToText(html: string): string {
  return htmlToText(html, {
    whitespaceCharacters: " \t\r\n\f\u200b\u200c\u00a0",
    selectors: [{ selector: "#preheader", format: "skip" }],
  })
}

export function parseTemplateVariables<T>({
  message,
  messageVariables,
}: {
  message: { [K in keyof T]: string }
  messageVariables: Map<string, string>
}): { [K in keyof T]: string } {
  const parsedTemplate = { ...message }

  for (const templateItemKey of Object.keys(parsedTemplate)) {
    for (const [variableKey, variableValue] of messageVariables) {
      // Info: it mutates `parsedTemplate` object
      parsedTemplate[templateItemKey as keyof typeof parsedTemplate] =
        parsedTemplate[
          templateItemKey as keyof typeof parsedTemplate
        ].replaceAll(variableKey, variableValue)
    }
  }

  return parsedTemplate
}
