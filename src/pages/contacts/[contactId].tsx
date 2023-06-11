import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input } from "@/components/form"
import ListPicker from "@/components/lists/list-picker"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { getLocalDateTime } from "@/libs/datetime"
import { fetcher } from "@/libs/fetcher"
import type { ApiResponse, StringValues } from "@/libs/types"
import { Contact } from "@/modules/contacts"
import { useRouter } from "next/router"
import { useState } from "react"
import useSWR from "swr"

export default function EditContact() {
  const [errorMsg, setErrorMsg] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { contactId } = router.query
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/contacts/${contactId}`,
    fetcher
  )
  const contact = data?.contact as StringValues<Contact> | undefined

  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  if (!contact) return null

  const handleFormSubmit = async function (event: React.SyntheticEvent) {
    event.preventDefault()

    setIsSubmitted(true)
    setIsSuccess(false)

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch(`/api/v1/contacts/${contact.id}`, {
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

  let unsubscribedAt
  if (contact.unsubscribedAt) {
    unsubscribedAt = getLocalDateTime(new Date(contact.unsubscribedAt))
  }

  return (
    <>
      <MetaHead title="Contact details" />

      <Navbar />

      <main>
        <div className="mt-8 lg:grid lg:grid-cols-[2fr_3fr] gap-8 justify-between">
          <section>
            <h2>Contact details</h2>

            <form onSubmit={handleFormSubmit}>
              <fieldset disabled={isSubmitted}>
                <ListPicker currentId={contact.listId} isClearable={false} />

                <Input
                  label="Email"
                  id="input-email"
                  name="email"
                  type="email"
                  defaultValue={contact.email}
                />

                <Input
                  label="Unsubscribed at (local time)"
                  id="input-unsubscribed-at"
                  name="unsubscribedAt"
                  type="datetime-local"
                  defaultValue={unsubscribedAt}
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
        </div>
      </main>
    </>
  )
}
