import { marked } from "marked"
import { useRouter } from "next/router"
import { useState } from "react"
import useSWR from "swr"
import { appConfig } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input, Textarea } from "@/components/form"
import ListPicker from "@/components/lists/list-picker"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { useTextareaChange } from "@/hooks/use-textarea-change"
import { getLocalDateTime } from "@/libs/datetime"
import { fetcher } from "@/libs/fetcher"
import type { ApiResponse, StringValues } from "@/libs/types"
import type { List } from "@/modules/lists"
import type { Newsletter } from "@/modules/newsletters"

const templateMarkdownExample = `# Newsletter title

<p>
  <a href="{{unsubscribe}}">Unsubscribe (html link)</a>
</p>

[Unsubscribe (markdown link)]({{unsubscribe}})
`

export default function AddNewsletter() {
  const { textareaValue, handleTextareaChange } = useTextareaChange()
  const [errorMsg, setErrorMsg] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  async function handleFormSubmit(event: React.SyntheticEvent) {
    event.preventDefault()

    setIsSubmitted(true)
    setIsSuccess(false)

    const formData = new FormData(event.target as HTMLFormElement)
    const toSendAfter = new Date(
      (formData.get("toSendAfter") as string) || getLocalDateTime()
    ).toISOString()
    const listIdsToExclude = formData.getAll("listIdsToExclude")
    const response = await fetch(`/api/v1/newsletters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...Object.fromEntries(formData.entries()),
        toSendAfter,
        listIdsToExclude,
      }),
    })
    const { newsletter, error } = (await response.json()) as ApiResponse & {
      newsletter?: StringValues<Newsletter>
    }

    if (error) {
      setErrorMsg(error)
      setIsSubmitted(false)
      return
    }

    setErrorMsg("")
    setIsSubmitted(false)
    setIsSuccess(true)
    setTimeout(() => setIsSuccess(false), 1500)

    if (newsletter?.id) {
      router.push(`/newsletters/${newsletter.id}`)
    }
  }

  const { data, error, isLoading } = useSWR("/api/v1/lists", fetcher)
  const lists = data?.lists as StringValues<List[]> | undefined

  return (
    <>
      <MetaHead title="Schedule newsletter" />

      <Navbar />

      <main>
        <div className="mt-8 lg:grid lg:grid-cols-[2fr_3fr] gap-8 justify-between">
          <section>
            <h2>Newsletter details</h2>

            <form onSubmit={handleFormSubmit}>
              <fieldset disabled={isSubmitted}>
                {lists && lists.length > 0 ? (
                  <>
                    <ListPicker selectName="listId" label="List to send to" />

                    <ListPicker
                      selectName="listIdsToExclude"
                      label="Lists to exclude"
                      isMulti={true}
                    />
                  </>
                ) : (
                  <>
                    {isLoading && <span>Loading...</span>}
                    {error && <span>Failed to load</span>}
                    {lists?.length === 0 && <span>No data</span>}
                  </>
                )}

                <Input
                  label="Scheduled date"
                  id="input-datetime"
                  name="toSendAfter"
                  type="datetime-local"
                  className="inline-block w-full placeholder:text-slate-400/60 border-solid border bg-slate-50/50 border-slate-300 px-3 py-1.5 rounded"
                />

                <h2>Newsletter template</h2>

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
                  defaultValue="Newsletter subject"
                  placeholder="Newsletter subject"
                />
                <Input
                  label="Preheader"
                  id="input-preheader"
                  name="preheader"
                  type="text"
                  defaultValue=""
                  placeholder=""
                />
                <Textarea
                  label="Email template (markdown)"
                  id="textarea-markdown"
                  name="markdown"
                  rows={5}
                  defaultValue={templateMarkdownExample}
                  placeholder={templateMarkdownExample}
                  onChange={handleTextareaChange}
                />

                <div className="mt-8">
                  <ErrorMsg errorMsg={errorMsg} />
                  <Button
                    type="submit"
                    isLoading={isSubmitted}
                    isSuccess={isSuccess}
                  >
                    Schedule
                  </Button>
                </div>
              </fieldset>
            </form>
          </section>

          <section>
            <h2>Newsletter template preview</h2>

            <div
              className="reset mt-10 border-solid border border-slate-200 p-4 h-max max-h-[600px] rounded overflow-auto"
              dangerouslySetInnerHTML={{
                __html: marked.parse(textareaValue || templateMarkdownExample),
              }}
            />
          </section>
        </div>
      </main>
    </>
  )
}
