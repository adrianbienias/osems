export function SignupForm({ listId }: { listId: string }) {
  return (
    <form
      action={`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/public/contacts`}
      method="POST"
    >
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
