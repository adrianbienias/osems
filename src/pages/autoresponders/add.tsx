import { config } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input, Textarea } from "@/components/form"
import ListPicker from "@/components/lists/list-picker"
import { Navbar } from "@/components/navbar"
import type { ApiResponse, StringValues } from "@/libs/types"
import type { Autoresponder } from "@/modules/autoresponders"
import { useRouter } from "next/router"
import { useState } from "react"

const templateHtmlExample = `<p>Test message</p>
<p><a href="{{unsubscribe}}">Unsubscribe</a></p>`

export default function AddAutoresponder() {
  const [html, setHtml] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const router = useRouter()

  function handleHtmlChange(event: React.SyntheticEvent) {
    const target = event.target as HTMLTextAreaElement
    const htmlData = target.value

    setHtml(htmlData)
  }

  async function handleFormSubmit(event: React.SyntheticEvent) {
    event.preventDefault()

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch(`/api/v1/autoresponders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...Object.fromEntries(formData.entries()),
      }),
    })
    const { autoresponder, error } = (await response.json()) as ApiResponse & {
      autoresponder?: StringValues<Autoresponder>
    }

    if (error) {
      setErrorMsg(error)
      return
    }

    setErrorMsg("")

    if (autoresponder?.id) {
      router.push(`/autoresponders`)
    }
  }

  return (
    <>
      <Navbar />

      <main>
        <div className="mt-8 flex flex-col md:flex-row gap-8 justify-between">
          <section className="grow-[0.25]">
            <h2>Autoresponder details</h2>

            <form onSubmit={handleFormSubmit}>
              <ListPicker />

              <Input
                label="Delay days"
                id="input-delay-days"
                name="delayDays"
                type="number"
                defaultValue={0}
                min={0}
              />

              <h2>Autoresponder template</h2>

              <Input
                label="Sender (set in .env)"
                id="input-from"
                name="from"
                type="text"
                defaultValue={config.sender}
                className="text-slate-400"
                disabled
              />
              <Input
                label="Subject"
                id="input-subject"
                name="subject"
                type="text"
                defaultValue="Autoresponder subject"
                placeholder="Autoresponder subject"
              />
              <Textarea
                label="Email template (HTML)"
                id="textarea-html"
                name="html"
                rows={5}
                defaultValue={templateHtmlExample}
                placeholder={templateHtmlExample}
                onChange={handleHtmlChange}
              />

              <div className="mt-8">
                <ErrorMsg errorMsg={errorMsg} />
                <Button type="submit">Add</Button>
              </div>
            </form>
          </section>

          <section className="grow-[0.75]">
            <h2>Autoresponder template preview</h2>

            <div
              className="reset mt-10 border-solid border border-slate-200 p-4 h-max max-h-[600px] rounded overflow-auto"
              dangerouslySetInnerHTML={{ __html: html || templateHtmlExample }}
            />
          </section>
        </div>
      </main>
    </>
  )
}
