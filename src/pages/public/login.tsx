import { config } from "@/app-config"
import { ErrorMsg } from "@/components/alert"
import { Button } from "@/components/button"
import { Input } from "@/components/form"
import { verifyJwt } from "@/modules/auth"
import { getCookie } from "cookies-next"
import type { NextApiRequest, NextApiResponse } from "next"
import { useState } from "react"

export default function Login() {
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault()

    const formData = new FormData(event.target as HTMLFormElement)
    const response = await fetch("/api/v1/public/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    })

    const { error } = (await response.json()) as { error?: string }
    if (error) {
      return setErrorMsg(error)
    }

    setErrorMsg("")
    setSuccessMsg(`Check your email inbox ${formData.get("email")}`)
  }

  return (
    <>
      <div className="max-w-sm mx-auto">
        <h1>Log in</h1>

        {successMsg ? (
          <p>{successMsg}</p>
        ) : (
          <>
            <form method="POST" onSubmit={handleSubmit}>
              <Input label="Admin email" name="email" />
              <Button>Submit</Button>

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
  const adminJwt = getCookie(config.adminJwtCookieName, { req })
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