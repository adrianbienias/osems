import { config } from "@/app-config"

export function SignupForm({ listId }: { listId: string }) {
  return (
    <form action={config.signupFormSubmitUrl} method="POST">
      <input type="hidden" name="listId" value={listId} />
      <label htmlFor="input-email">Email: </label>
      <input
        name="email"
        type="email"
        id="input-email"
        placeholder="john.doe@example.com"
      />
      <button>Sign up</button>
    </form>
  )
}
