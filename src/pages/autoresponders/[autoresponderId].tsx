import { appConfig } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input, Textarea } from "@/components/form"
import ListPicker from "@/components/lists/list-picker"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { useTextareaChange } from "@/hooks/use-textarea-change"
import { fetcher } from "@/libs/fetcher"
import type { ApiResponse } from "@/libs/types"
import type { Autoresponder } from "@/modules/autoresponders"
import type { Template } from "@/modules/templates"
import { marked } from "marked"
import { useRouter } from "next/router"
import { useState } from "react"
import useSWR from "swr"

export default function ShowAutoresponder() {
  const { textareaValue, handleTextareaChange } = useTextareaChange()
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
        <div className="mt-8 lg:grid lg:grid-cols-[2fr_3fr] gap-8 justify-between">
          <section>
            <h2>Autoresponder details</h2>

            <form onSubmit={handleFormSubmit}>
              <fieldset disabled={isSubmitted}>
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
                <Input
                  label="Preheader"
                  id="input-preheader"
                  name="preheader"
                  type="text"
                  defaultValue={template.preheader}
                  placeholder={template.preheader}
                />
                <Textarea
                  label="Email template (markdown)"
                  id="textarea-markdown"
                  name="markdown"
                  rows={5}
                  className="resize-y"
                  defaultValue={template.markdown}
                  placeholder={template.markdown}
                  onChange={handleTextareaChange}
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
              </fieldset>
            </form>
          </section>

          <section>
            <h2>Autoresponder template preview</h2>

            <div
              className="reset mt-10 border-solid border border-slate-200 p-4 h-max max-h-[600px] rounded overflow-auto"
              dangerouslySetInnerHTML={{
                __html: marked.parse(textareaValue || template.markdown),
              }}
            />
          </section>
        </div>
      </main>
    </>
  )
}
