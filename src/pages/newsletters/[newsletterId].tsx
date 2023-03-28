import { DatetimeUtc } from "@/components/datetime-utc"
import { Navbar } from "@/components/navbar"
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/table"
import { fetcher } from "@/libs/fetcher"
import { Newsletter, Sending, Template } from "@prisma/client"
import { useRouter } from "next/router"
import { useRef } from "react"
import useSWR from "swr"

export default function ListWithContacts() {
  const router = useRouter()
  const refreshInterval = useRef(1000)

  const { newsletterId } = router.query
  const { data, error, isLoading } = useSWR(
    `/api/v1/newsletters/${newsletterId}`,
    fetcher,
    {
      refreshInterval: refreshInterval.current,
    }
  )

  const newsletter = data?.newsletter as
    | (Newsletter & { sendings: Sending[] })
    | undefined
  const template = data?.template as Template | undefined

  if (newsletter?.sentAt) {
    refreshInterval.current = 0
  }

  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  if (!newsletter) return <div>No data</div>
  if (!template) return <div>No data</div>

  return (
    <>
      <Navbar />

      <main>
        <div className="mt-8 flex flex-col md:flex-row gap-8 justify-between">
          <section className="grow-[0.25] order-2 md:order-1">
            <h2>Sendings</h2>

            <Table>
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>Sent at</Th>
                </Tr>
              </Thead>
              <Tbody>
                {newsletter.sendings.length > 0 ? (
                  newsletter.sendings.map((sending) => (
                    <Tr key={sending.email}>
                      <Td>{sending.email}</Td>
                      <Td>
                        <DatetimeUtc datetime={sending.sentAt} />
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={2} className="text-center">
                      No data
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </section>

          <section className="grow-[0.75] order-1 md:order-2">
            <h2>Newsletter template preview</h2>

            <p>
              <span className="text-slate-500 text-base">Subject:</span>{" "}
              {template.subject}
            </p>
            <div
              className="reset mt-4 border-solid border border-slate-200 p-4 h-max max-h-[600px] rounded overflow-auto"
              dangerouslySetInnerHTML={{
                __html: template.html,
              }}
            />
          </section>
        </div>
      </main>
    </>
  )
}
