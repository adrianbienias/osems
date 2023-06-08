import Head from "next/head"

export default function MetaHead({ title }: { title: string }) {
  const titleText = `${title} | OSEMS`

  return (
    <>
      <Head>
        <title>{titleText}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
    </>
  )
}
