import { useRouter } from "next/router"
import { useState } from "react"
import { useSWRConfig } from "swr"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input } from "@/components/form"
import ListPicker from "@/components/lists/list-picker"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import type { ApiResponse } from "@/libs/types"

export default function AddContact() {
  const [errorMsg, setErrorMsg] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { mutate } = useSWRConfig()

  async function handleFormSubmit(event: React.SyntheticEvent) {
    event.preventDefault()

    setIsSubmitted(true)
    setIsSuccess(false)

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch(`/api/v1/contacts`, {
      method: "POST",
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

    mutate("/api/v1/contacts")
    router.push(`/contacts`)
  }

  return (
    <>
      <MetaHead title="Add contact" />

      <Navbar />

      <main>
        <div className="mt-8 max-w-lg">
          <section>
            <h2>Add contact</h2>

            <form onSubmit={handleFormSubmit}>
              <fieldset disabled={isSubmitted}>
                <ListPicker />

                <Input
                  label="Email"
                  id="input-email"
                  name="email"
                  type="email"
                />

                <div className="mt-8">
                  <ErrorMsg errorMsg={errorMsg} />
                  <Button
                    type="submit"
                    isLoading={isSubmitted}
                    isSuccess={isSuccess}
                  >
                    Add
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
