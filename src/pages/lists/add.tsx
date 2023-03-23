import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input, Textarea } from "@/components/form"
import { Navbar } from "@/components/navbar"
import { StringValues } from "@/libs/types"
import { List } from "@prisma/client"
import { useRouter } from "next/router"
import { useRef, useState } from "react"

const templateHtmlExample = `<p><a href="{{confirmation}}">Click here to confirm signup &raquo;</a></p>`

export default function Lists() {
  const [html, setHtml] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const formRef = useRef(null)
  const router = useRouter()

  async function handleFormSubmit(event: React.SyntheticEvent) {
    event.preventDefault()

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch("/api/v1/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    })
    const { list, error } = (await response.json()) as {
      list: StringValues<List>
      error?: string
    }

    if (error) {
      setErrorMsg(error)
      return
    }

    setErrorMsg("")

    router.push(`/lists/${list.id}`)
  }

  function handleHtmlChange(event: React.SyntheticEvent) {
    const target = event.target as HTMLTextAreaElement
    const htmlData = target.value

    setHtml(htmlData)
  }

  return (
    <>
      <Navbar />

      <main>
        <div className="mt-8 flex flex-col md:flex-row gap-8 justify-between">
          <section className="grow-[0.25]">
            <h2>List details</h2>

            <form onSubmit={handleFormSubmit} ref={formRef}>
              <div>
                <Input
                  label="List name"
                  id="input-list-name"
                  name="name"
                  type="text"
                  defaultValue="The Best Newsletter"
                  placeholder="The Best Newsletter"
                />
                <Input
                  label="Sender (from)"
                  id="input-from"
                  name="from"
                  type="text"
                  defaultValue="John Doe <email@example.com>"
                  placeholder="John Doe <email@example.com>"
                />

                <Input
                  label="Signup redirect URL"
                  id="input-signup-redirect-url"
                  name="signupRedirectUrl"
                  type="text"
                  defaultValue={`${process.env.NEXT_PUBLIC_BASE_URL}/public/confirmation-required`}
                  placeholder={`${process.env.NEXT_PUBLIC_BASE_URL}/public/confirmation-required`}
                />
                <Input
                  label="Confirmation redirect URL"
                  id="input-confirmation-redirect-url"
                  name="confirmationRedirectUrl"
                  type="text"
                  defaultValue={`${process.env.NEXT_PUBLIC_BASE_URL}/public/subscribed-successfully`}
                  placeholder={`${process.env.NEXT_PUBLIC_BASE_URL}/public/subscribed-successfully`}
                />
                <Input
                  label="Unsubscribe redirect URL"
                  id="input-unsubscribe-redirect-url"
                  name="unsubscribeRedirectUrl"
                  type="text"
                  defaultValue={`${process.env.NEXT_PUBLIC_BASE_URL}/public/unsubscribed`}
                  placeholder={`${process.env.NEXT_PUBLIC_BASE_URL}/public/unsubscribed`}
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
                <Button type="submit">Add new list</Button>
              </div>
            </form>
          </section>

          <section className="grow-[0.75]">
            <h2>Confirmation email preview</h2>

            <div
              className="reset mt-10 border-solid border border-slate-200 p-4 h-max max-h-[600px] rounded overflow-auto"
              dangerouslySetInnerHTML={{
                __html: html || templateHtmlExample,
              }}
            />
          </section>
        </div>
      </main>
    </>
  )
}
