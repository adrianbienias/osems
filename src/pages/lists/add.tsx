import { appConfig } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input, Textarea } from "@/components/form"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import type { ApiResponse, StringValues } from "@/libs/types"
import type { List } from "@/modules/lists"
import { useRouter } from "next/router"
import { useState } from "react"

const templateHtmlExample = `<p><a href="{{confirmation}}">Click here to confirm signup &raquo;</a></p>`

export default function AddList() {
  const [html, setHtml] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  async function handleFormSubmit(event: React.SyntheticEvent) {
    event.preventDefault()

    setIsSubmitted(true)
    setIsSuccess(false)

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch("/api/v1/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    })
    const { list, error } = (await response.json()) as ApiResponse & {
      list: StringValues<List>
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

    router.push(`/lists/${list.id}`)
  }

  function handleHtmlChange(event: React.SyntheticEvent) {
    const target = event.target as HTMLTextAreaElement
    const htmlData = target.value

    setHtml(htmlData)
  }

  return (
    <>
      <MetaHead title="Add list" />

      <Navbar />

      <main>
        <div className="mt-8 flex flex-col md:flex-row gap-8 justify-between">
          <section className="grow-[0.25]">
            <form onSubmit={handleFormSubmit}>
              <fieldset disabled={isSubmitted} className="border-none">
                <div>
                  <h2>List details</h2>
                  <Input
                    label="List name"
                    id="input-list-name"
                    name="name"
                    type="text"
                    defaultValue="The Best Newsletter"
                    placeholder="The Best Newsletter"
                  />
                  <Input
                    label="Signup redirect URL"
                    id="input-signup-redirect-url"
                    name="signupRedirectUrl"
                    type="text"
                    defaultValue={`${appConfig.baseUrl}/public/confirmation-required`}
                    placeholder={`${appConfig.baseUrl}/public/confirmation-required`}
                  />
                  <Input
                    label="Confirmation redirect URL"
                    id="input-confirmation-redirect-url"
                    name="confirmationRedirectUrl"
                    type="text"
                    defaultValue={`${appConfig.baseUrl}/public/subscribed-successfully`}
                    placeholder={`${appConfig.baseUrl}/public/subscribed-successfully`}
                  />
                  <Input
                    label="Unsubscribe redirect URL"
                    id="input-unsubscribe-redirect-url"
                    name="unsubscribeRedirectUrl"
                    type="text"
                    defaultValue={`${appConfig.baseUrl}/public/unsubscribed`}
                    placeholder={`${appConfig.baseUrl}/public/unsubscribed`}
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
                    defaultValue="Confirmation required"
                    placeholder="Confirmation required"
                  />
                  <Textarea
                    label="Confirmation email template (HTML)"
                    id="textarea-html"
                    name="html"
                    rows={5}
                    defaultValue={templateHtmlExample}
                    placeholder={templateHtmlExample}
                    onChange={handleHtmlChange}
                  />
                </div>

                <div className="mt-8">
                  <ErrorMsg errorMsg={errorMsg} />
                  <Button
                    type="submit"
                    isLoading={isSubmitted}
                    isSuccess={isSuccess}
                  >
                    Add new list
                  </Button>
                </div>
              </fieldset>
            </form>
          </section>

          <section className="grow-[0.75]">
            <h2>Confirmation template preview</h2>

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
