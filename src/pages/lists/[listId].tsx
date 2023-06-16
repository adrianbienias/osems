import { appConfig } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input, Textarea } from "@/components/form"
import ListSignup from "@/components/lists/list-signup"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { useHtmlChange } from "@/hooks/use-html-change"
import { fetcher } from "@/libs/fetcher"
import type { ApiResponse, StringValues } from "@/libs/types"
import { Contact, List, Template } from "@prisma/client"
import { useRouter } from "next/router"
import { useState } from "react"
import useSWR from "swr"

export default function ShowList() {
  const router = useRouter()
  const { html, handleHtmlChange } = useHtmlChange()
  const [errorMsg, setErrorMsg] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
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

  const handleFormSubmit = async function (event: React.SyntheticEvent) {
    event.preventDefault()

    setIsSubmitted(true)
    setIsSuccess(false)

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch(`/api/v1/lists/${list.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
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

  const confirmationTemplate = data?.confirmationTemplate as Template

  return (
    <>
      <MetaHead title="List details" />

      <Navbar />

      <main>
        <div className="mt-8 lg:grid lg:grid-cols-[2fr_3fr] gap-8 justify-between">
          <section>
            <h2>List details</h2>

            <form onSubmit={handleFormSubmit}>
              <fieldset disabled={isSubmitted}>
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
                  <Button
                    type="submit"
                    isLoading={isSubmitted}
                    isSuccess={isSuccess}
                  >
                    Save changes
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
