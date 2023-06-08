import MetaHead from "@/components/meta-head"

export default function ConfirmationRequired() {
  return (
    <>
      <MetaHead title="Confirmation required" />

      <h1>Confirmation required</h1>
      <p>Check out your inbox.</p>
      <p>
        You can edit this page at{" "}
        <code>src/pages/public/confirmation-required.tsx</code>
        <br />
        or simply provide a different <em>Signup redirect URL</em> in the list
        settings.
      </p>
    </>
  )
}
