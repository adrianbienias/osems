import { DatetimeUtc } from "@/components/datetime-utc"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/table"
import { fetcher } from "@/libs/fetcher"
import type { List } from "@/modules/lists"
import type { Template } from "@/modules/templates"
import type { Newsletter, NewsletterLog } from "@prisma/client"
import Link from "next/link"
import { useRouter } from "next/router"
import { useRef } from "react"
import useSWR from "swr"

export default function ShowNewsletter() {
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
    | (Newsletter & { logs: NewsletterLog[]; list: List })
    | undefined
  const template = data?.template as Template | undefined
  const excludedLists = data?.excludedLists as List[]

  if (newsletter?.sentAt) {
    refreshInterval.current = 0
  }

  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  if (!newsletter || !template) return null

  return (
    <>
      <MetaHead title="Newsletter details" />

      <Navbar />

      <main>
        <div className="mt-8 lg:grid lg:grid-cols-[2fr_3fr] gap-8 justify-between">
          <section className="order-2 lg:order-1">
            <h2>Sending logs</h2>

            <Table>
              <Thead>
                <Tr>
                  <Th>No.</Th>
                  <Th>Email</Th>
                  <Th>Sent at</Th>
                </Tr>
              </Thead>
              <Tbody>
                {newsletter.logs.length > 0 ? (
                  newsletter.logs.map((log, index) => (
                    <Tr key={log.email}>
                      <Td>{index + 1}</Td>
                      <Td>{log.email}</Td>
                      <Td>
                        <DatetimeUtc datetime={log.sentAt} />
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

          <section className="order-1 lg:order-2">
            <h2>Newsletter details</h2>

            <h3 className="mb-0 font-normal text-base text-slate-500">
              Status
            </h3>
            <p className="mt-0">{newsletter.sentAt ? "Sent" : "Scheduled"}</p>

            <h3 className="mb-0 font-normal text-base text-slate-500">
              Scheduled to send at
            </h3>
            <p className="mt-0 [&>span]:text-black">
              <DatetimeUtc datetime={newsletter.toSendAfter} />
            </p>

            <h3 className="mb-0 font-normal text-base text-slate-500">List</h3>
            <p className="mt-0">
              <Link href={`/lists/${newsletter.list.id}`}>
                {newsletter.list.name}
              </Link>
            </p>

            <h3 className="mb-0 font-normal text-base text-slate-500">
              Lists excluded
            </h3>
            {excludedLists.length > 0 ? (
              <ul className="mt-0 p-0 list-inside">
                {excludedLists.map((list) => (
                  <li key={list.id} className="m-0">
                    <Link href={`/lists/${list.id}`}>{list.name}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-0">None</p>
            )}

            <h3 className="mb-0 font-normal text-base text-slate-500">
              Subject
            </h3>
            <p className="mt-0">{template.subject}</p>

            <h2 className="mt-0">Newsletter template preview</h2>
            <div
              className="reset mt-4 border-solid border border-slate-200 p-4 h-max max-h-[600px] rounded overflow-auto"
              dangerouslySetInnerHTML={{ __html: template.html }}
            />
          </section>
        </div>
      </main>
    </>
  )
}
