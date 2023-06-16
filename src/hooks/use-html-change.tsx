import { useState } from "react"

export function useHtmlChange() {
  const [html, setHtml] = useState("")

  function handleHtmlChange(event: React.SyntheticEvent) {
    const target = event.target as HTMLTextAreaElement
    const htmlData = target.value

    setHtml(htmlData)
  }

  return { html, handleHtmlChange }
}
