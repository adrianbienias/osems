import { Navbar } from "@/components/navbar"
import { readFileSync } from "fs"
import { marked } from "marked"
import Head from "next/head"

export default function Home({ readmeHtml }: { readmeHtml: string }) {
  return (
    <>
      <Head>
        <title>OSEMS</title>
        <meta
          name="description"
          content="Open Source Email Marketing Software"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
