import { appConfig } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input } from "@/components/form"
import MetaHead from "@/components/meta-head"
import { verifyJwt } from "@/modules/auth"
import { getCookie } from "cookies-next"
import type { NextApiRequest, NextApiResponse } from "next"
import { useState } from "react"

export default function Login() {
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault()

    setIsSubmitted(true)
    setIsSuccess(false)

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch("/api/v1/public/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    })

    const { error } = (await response.json()) as { error?: string }
    if (error) {
      setErrorMsg(error)
      setIsSubmitted(false)
      return
    }

    setErrorMsg("")
    setIsSubmitted(false)
    setIsSuccess(true)
    setTimeout(() => setIsSuccess(false), 1500)
    setSuccessMsg(`Check your email inbox ${formData.get("email")}`)
  }

  return (
    <>
      <MetaHead title="Login" />

      <div className="max-w-sm mx-auto">
        <h1>Login</h1>

        {successMsg ? (
          <p>{successMsg}</p>
        ) : (
          <>
            <form method="POST" onSubmit={handleSubmit}>
              <Input label="Admin email" name="email" />
              <Button
                type="submit"
                isLoading={isSubmitted}
                isSuccess={isSuccess}
              >
                Submit
              </Button>

              <ErrorMsg errorMsg={errorMsg} />
            </form>
          </>
        )}
      </div>
    </>
  )
}

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse
}) {
  const adminJwt = getCookie(appConfig.adminJwtCookieName, { req })
  if (!adminJwt || typeof adminJwt !== "string") {
    return { props: {} }
  }

  try {
    const decodedJwt = await verifyJwt(adminJwt)
    if (decodedJwt.isAdmin) {
      return { redirect: { destination: "/", permanent: false } }
    }
  } catch (error) {
    console.error(error)

    return { props: {} }
  }
}
