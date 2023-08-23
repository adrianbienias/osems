import { useRouter } from "next/router"
import MetaHead from "@/components/meta-head"
import { SignupForm } from "@/components/signup-form"

export default function SignupFormError() {
  const router = useRouter()
  const { error, listId } = router.query

  return (
    <>
      <MetaHead title="Signup" />

      {typeof listId === "string" && <SignupForm listId={listId} />}

      {error && (
        <p
          role="alert"
          className="text-sm bg-red-100 text-red-500 border-red-300 border-solid border py-1 px-2 rounded inline-block"
        >
          Error: {error}
        </p>
      )}
    </>
  )
}
