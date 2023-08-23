import { marked } from "marked"
import { useRouter } from "next/router"
import { useState } from "react"
import { appConfig } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input, Textarea } from "@/components/form"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { useTextareaChange } from "@/hooks/use-textarea-change"
import type { ApiResponse, StringValues } from "@/libs/types"
import type { List } from "@/modules/lists"

const templateMarkdownExample = `# Signup confirmation

<p>
  <a href="{{confirmation}}">Click here to confirm signup (html link) &raquo;</a>
</p>

[Click here to confirm signup (markdown link) &raquo;]({{confirmation}})
`

export default function AddList() {
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

  return (
    <>
      <MetaHead title="Add list" />

      <Navbar />

      <main>
        <div className="mt-8 lg:grid lg:grid-cols-[2fr_3fr] gap-8 justify-between">
          <section>
            <form onSubmit={handleFormSubmit}>
              <fieldset disabled={isSubmitted}>
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
                  <Input
                    label="Confirmation email preheader"
                    id="input-preheader"
                    name="preheader"
                    type="text"
                    defaultValue=""
                    placeholder=""
                  />
                  <Textarea
                    label="Confirmation email template (markdown)"
                    id="textarea-markdown"
                    name="markdown"
                    rows={5}
                    defaultValue={templateMarkdownExample}
                    placeholder={templateMarkdownExample}
                    onChange={handleTextareaChange}
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

          <section>
            <h2>Confirmation template preview</h2>

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
