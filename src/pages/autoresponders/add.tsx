import { appConfig } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input, Textarea } from "@/components/form"
import ListPicker from "@/components/lists/list-picker"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import type { ApiResponse } from "@/libs/types"
import { useRouter } from "next/router"
import { useState } from "react"
import { useSWRConfig } from "swr"

const templateHtmlExample = `<p>Test message</p>
<p><a href="{{unsubscribe}}">Unsubscribe</a></p>`

export default function AddAutoresponder() {
  const [html, setHtml] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { mutate } = useSWRConfig()

  function handleHtmlChange(event: React.SyntheticEvent) {
    const target = event.target as HTMLTextAreaElement
    const htmlData = target.value

    setHtml(htmlData)
  }

  async function handleFormSubmit(event: React.SyntheticEvent) {
    event.preventDefault()

    setIsSubmitted(true)
    setIsSuccess(false)

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch(`/api/v1/autoresponders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...Object.fromEntries(formData.entries()),
      }),
    })
    const { error } = (await response.json()) as ApiResponse

    if (error) {
      setErrorMsg(error)
      setIsSubmitted(false)
      return
    }

    setErrorMsg("")
    setIsSubmitted(false)
    setIsSuccess(true)
    setTimeout(() => setIsSuccess(false), 1500)

    mutate("/api/v1/autoresponders")
    router.push(`/autoresponders`)
  }

  return (
    <>
      <MetaHead title="Add autoresponder" />

      <Navbar />

      <main>
        <div className="mt-8 lg:grid lg:grid-cols-[2fr_3fr] gap-8 justify-between">
          <section>
            <h2>Autoresponder details</h2>

            <form onSubmit={handleFormSubmit}>
              <fieldset disabled={isSubmitted} className="border-none">
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
                  defaultValue={appConfig.sender}
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
                  <Button
                    type="submit"
                    isLoading={isSubmitted}
                    isSuccess={isSuccess}
                  >
                    Add
                  </Button>
                </div>
              </fieldset>
            </form>
          </section>

          <section>
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
