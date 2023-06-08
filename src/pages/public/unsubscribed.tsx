import MetaHead from "@/components/meta-head"

export default function Unsubscribed() {
  return (
    <>
      <MetaHead title="Unsubscribed" />

      <h1>Unsubscribed</h1>
      <p>You&apos;ve been unsubscribed successfully.</p>
      <p>
        You can edit this page at <code>src/pages/public/unsubscribed.tsx</code>
        <br />
        or simply provide a different <em>Unsubscribe redirect URL </em> in the
        list settings.
      </p>
    </>
  )
}
