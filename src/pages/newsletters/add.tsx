import { config } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input, Textarea } from "@/components/form"
import { Navbar } from "@/components/navbar"
import { getLocalDateTime } from "@/libs/datetime"
import { fetcher } from "@/libs/fetcher"
import type { ApiResponse, StringValues } from "@/libs/types"
import type { List } from "@/modules/lists"
import type { Newsletter } from "@/modules/newsletters"
import { useRouter } from "next/router"
import { useState } from "react"
import useSWR from "swr"

const templateHtmlExample = `<p>Test message</p>
<p><a href="{{unsubscribe}}">Unsubscribe</a></p>`

export default function AddNewsletter() {
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
      return
    }

    setErrorMsg("")

    if (newsletter?.id) {
      router.push(`/newsletters/${newsletter.id}`)
    }
  }

  const { data, error, isLoading } = useSWR("/api/v1/lists", fetcher)
  const lists = data?.lists as StringValues<List[]> | undefined

  return (
    <>
      <Navbar />

      <main>
        <div className="mt-8 flex flex-col md:flex-row gap-8 justify-between">
          <section className="grow-[0.25]">
            <h2>Newsletter details</h2>

            <form onSubmit={handleFormSubmit}>
              {lists && lists.length > 0 ? (
                <>
                  <h3>List to send to</h3>

                  <ul className="list-none p-0">
                    {lists.map((list) => (
                      <li key={list.id}>
                        <input
                          id={`list-to-include-${list.id}`}
                          type="radio"
                          name="listIdToInclude"
                          value={list.id}
                          className="mb-1 mr-2 w-4 h-4 bg-gray-50 border-solid border-gray-300 rounded-full text-blue-500 focus:ring-blue-500"
                        />
                        <label htmlFor={`list-to-include-${list.id}`}>
                          {list.name}
                        </label>
                        <span> </span>
                      </li>
                    ))}
                  </ul>

                  <h3>Lists to exclude</h3>

                  <ul className="list-none p-0">
                    {lists.map((list) => (
                      <li key={list.id}>
                        <input
                          id={`list-to-exclude-${list.id}`}
                          type="checkbox"
                          name="listIdsToExclude"
                          value={list.id}
                          className="mb-1 mr-2 w-4 h-4 bg-gray-50 border-solid border-gray-300 rounded text-blue-500 focus:ring-blue-500"
                        />
                        <label htmlFor={`list-to-exclude-${list.id}`}>
                          {list.name}
                        </label>
                        <span> </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  {isLoading && <span>Loading...</span>}
                  {error && <span>Failed to load</span>}
                  {lists?.length === 0 && <span>No data</span>}
                </>
              )}

              <h3 id="input-datetime">Scheduled date</h3>

              <input
                aria-labelledby="input-datetime"
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
                defaultValue={config.sender}
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
                <Button type="submit">Schedule</Button>
              </div>
            </form>
          </section>

          <section className="grow-[0.75]">
            <h2>Newsletter template preview</h2>

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
