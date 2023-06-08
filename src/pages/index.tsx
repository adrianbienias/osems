import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { readFileSync } from "fs"
import { marked } from "marked"

export default function Home({ readmeHtml }: { readmeHtml: string }) {
  return (
    <>
      <MetaHead title="Readme" />

      <Navbar />

      <main>
        <div
          dangerouslySetInnerHTML={{ __html: readmeHtml }}
          className="mb-16"
        />
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const readmeFile = readFileSync("./README.md", { encoding: "utf-8" })
  const readmeHtml = marked.parse(readmeFile)

  return {
    props: { readmeHtml },
  }
}
