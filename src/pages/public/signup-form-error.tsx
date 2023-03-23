import { SignupForm } from "@/components/signup-form"
import { useRouter } from "next/router"

export default function SignupFormError() {
  const router = useRouter()
  const { error, listId } = router.query

  return (
    <>
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
