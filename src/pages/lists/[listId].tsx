import { appConfig } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input, Textarea } from "@/components/form"
import ListSignup from "@/components/lists/list-signup"
import { Navbar } from "@/components/navbar"
import { fetcher } from "@/libs/fetcher"
import { ApiResponse, StringValues } from "@/libs/types"
import { Contact, List, Template } from "@prisma/client"
import { useRouter } from "next/router"
import { useState } from "react"
import useSWR from "swr"

export default function ShowList() {
  const router = useRouter()
  const [html, setHtml] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const { listId } = router.query
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/lists/${listId}`,
    fetcher
  )
  const list = data?.list as
    | (List & { contacts: StringValues<Contact[]> })
    | undefined

  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  if (!list) return null

  function handleHtmlChange(event: React.SyntheticEvent) {
    const target = event.target as HTMLTextAreaElement
    const htmlData = target.value

    setHtml(htmlData)
  }

  const handleFormSubmit = async function (event: React.SyntheticEvent) {
    event.preventDefault()

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch(`/api/v1/lists/${list.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    })

    const { error } = (await response.json()) as ApiResponse
    if (error) {
      setErrorMsg(error)
      return
    }

    setErrorMsg("")
    mutate()
  }

  const confirmationTemplate = data?.confirmationTemplate as Template

  return (
    <>
      <Navbar />

      <main>
        <div className="mt-8 flex flex-col md:flex-row gap-8 justify-between">
          <section className="grow-[0.25]">
            <h2>List details</h2>

            <form onSubmit={handleFormSubmit}>
              <div>
                <Input
                  label="List name"
                  id="input-list-name"
                  name="name"
                  type="text"
                  defaultValue={list.name}
                  placeholder={list.name}
                />
                <Input
                  label="Signup redirect URL"
                  id="input-signup-redirect-url"
                  name="signupRedirectUrl"
                  type="text"
                  defaultValue={list.signupRedirectUrl}
                  placeholder={list.signupRedirectUrl}
                />
                <Input
                  label="Confirmation redirect URL"
                  id="input-confirmation-redirect-url"
                  name="confirmationRedirectUrl"
                  type="text"
                  defaultValue={list.confirmationRedirectUrl}
                  placeholder={list.confirmationRedirectUrl}
                />
                <Input
                  label="Unsubscribe redirect URL"
                  id="input-unsubscribe-redirect-url"
                  name="unsubscribeRedirectUrl"
                  type="text"
                  defaultValue={list.unsubscribeRedirectUrl}
                  placeholder={list.unsubscribeRedirectUrl}
                />
              </div>

              <h2>Confirmation template</h2>

              <div>
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
                  label="Confirmation email subject"
                  id="input-subject"
                  name="subject"
                  type="text"
                  defaultValue={confirmationTemplate.subject}
                  placeholder={confirmationTemplate.subject}
                />
                <Textarea
                  label="Confirmation email template (HTML)"
                  id="textarea-html"
                  name="html"
                  rows={5}
                  defaultValue={confirmationTemplate.html}
                  placeholder={confirmationTemplate.html}
                  onChange={handleHtmlChange}
                />
              </div>

              <div className="mt-8">
                <ErrorMsg errorMsg={errorMsg} />
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </section>

          <section className="grow-[0.75]">
            <h2>Confirmation template preview</h2>

            <div
              className="reset mt-10 border-solid border border-slate-200 p-4 h-max max-h-[600px] rounded overflow-auto"
              dangerouslySetInnerHTML={{
                __html: html || confirmationTemplate.html,
              }}
            />
          </section>
        </div>

        <div className="my-16">
          <ListSignup list={list} />
        </div>
      </main>
    </>
  )
}
