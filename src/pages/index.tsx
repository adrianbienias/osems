import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <>
      <MetaHead title="Readme" />

      <Navbar />

      <main>
        <h1>OSEMS</h1>

        <p>Open Source Email Marketing Software</p>
        <p>
          <a href="https://osems.dev" target="_blank" rel="noopener">
            🗒️ Check documentation »
          </a>
        </p>
      </main>
    </>
  )
}
