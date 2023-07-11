import { useState } from "react"

export function useTextareaChange() {
  const [textareaValue, setTextareaValue] = useState("")

  function handleTextareaChange(event: React.SyntheticEvent) {
    const target = event.target as HTMLTextAreaElement
    setTextareaValue(target.value)
  }

  return { textareaValue, handleTextareaChange }
}
