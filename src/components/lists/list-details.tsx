import { config } from "@/app-config"
import { PropListWithConfirmationTemplate } from "@/libs/types"
import { useState } from "react"
import { ErrorMsg } from "../alert"
import { Button } from "../button"
import { Input, Textarea } from "../form"

export default function Details({
  list,
  confirmationTemplate,
  mutate,
}: PropListWithConfirmationTemplate & { mutate: () => void }) {
  const [html, setHtml] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  function handleHtmlChange(event: React.SyntheticEvent) {
    const target = event.target as HTMLTextAreaElement
    const htmlData = target.value

    setHtml(htmlData)
  }

  async function handleFormSubmit(event: React.SyntheticEvent) {
    event.preventDefault()

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch(`/api/v1/lists/${list.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // Workaround with data type set to `any` https://github.com/microsoft/TypeScript/issues/30584#issuecomment-523207192
      body: new URLSearchParams(formData as any).toString(),
    })

    const { error } = (await response.json()) as { error?: string }
    if (error) {
      setErrorMsg(error)
      return
    }

    setErrorMsg("")
    mutate()
  }

  return (
    <>
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
              defaultValue={config.sender}
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
    </>
  )
}
