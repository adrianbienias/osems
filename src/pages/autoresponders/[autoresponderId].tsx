import { appConfig } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input, Textarea } from "@/components/form"
import ListPicker from "@/components/lists/list-picker"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { fetcher } from "@/libs/fetcher"
import type { ApiResponse } from "@/libs/types"
import type { Autoresponder } from "@/modules/autoresponders"
import type { Template } from "@/modules/templates"
import { useRouter } from "next/router"
import { useState } from "react"
import useSWR from "swr"

export default function ShowAutoresponder() {
  const [html, setHtml] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { autoresponderId } = router.query
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/autoresponders/${autoresponderId}`,
    fetcher
  )
  const autoresponder = data?.autoresponder as Autoresponder | undefined
  const template = data?.template as Template | undefined

  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  if (!autoresponder || !template) return null

  function handleHtmlChange(event: React.SyntheticEvent) {
    const target = event.target as HTMLTextAreaElement
    const htmlData = target.value

    setHtml(htmlData)
  }

  const handleFormSubmit = async function (event: React.SyntheticEvent) {
    event.preventDefault()

    setIsSubmitted(true)
    setIsSuccess(false)

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch(`/api/v1/autoresponders/${autoresponder.id}`, {
      method: "PATCH",
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

    mutate()
  }

  return (
    <>
      <MetaHead title="Autoresponder details" />

      <Navbar />

      <main>
        <div className="mt-8 flex flex-col md:flex-row gap-8 justify-between">
          <section className="grow-[0.25]">
            <h2>Autoresponder details</h2>

            <form onSubmit={handleFormSubmit}>
              <ListPicker currentId={autoresponder.listId} />

              <Input
                label="Delay days"
                id="input-delay-days"
                name="delayDays"
                type="number"
                defaultValue={autoresponder.delayDays}
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
                defaultValue={template.subject}
                placeholder={template.subject}
              />
              <Textarea
                label="Email template (HTML)"
                id="textarea-html"
                name="html"
                rows={5}
                defaultValue={template.html}
                placeholder={template.html}
                onChange={handleHtmlChange}
              />

              <div className="mt-8">
                <ErrorMsg errorMsg={errorMsg} />
                <Button
                  type="submit"
                  isLoading={isSubmitted}
                  isSuccess={isSuccess}
                >
                  Save
                </Button>
              </div>
            </form>
          </section>

          <section className="grow-[0.75]">
            <h2>Autoresponder template preview</h2>

            <div
              className="reset mt-10 border-solid border border-slate-200 p-4 h-max max-h-[600px] rounded overflow-auto"
              dangerouslySetInnerHTML={{ __html: html || template.html }}
            />
          </section>
        </div>
      </main>
    </>
  )
}
