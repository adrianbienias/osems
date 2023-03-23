import { DatetimeUtc } from "@/components/datetime-utc"
import { LinkButton } from "@/components/button"
import { Navbar } from "@/components/navbar"
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/table"
import { fetcher } from "@/libs/fetcher"
import { StringValues } from "@/libs/types"
import { Newsletter } from "@prisma/client"
import Link from "next/link"
import { useRouter } from "next/router"
import useSWR from "swr"

export default function Lists() {
  const router = useRouter()
  const { data, error, isLoading } = useSWR("/api/v1/newsletters", fetcher)

  const newsletters = data?.newsletters as StringValues<Newsletter[]>

  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  if (!newsletters) return <div>No data</div>

  return (
    <>
      <Navbar />

      <main>
        <h2 className="mb-4">Newsletters</h2>
        <p>
          <LinkButton href="/newsletters/add">
            Schedule new newsletter
          </LinkButton>
        </p>

        <Table>
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Created at</Th>
              <Th>Scheduled to send at</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {newsletters.length > 0 ? (
              newsletters.map((newsletter) => (
                <Tr key={newsletter.id}>
                  <Td>
                    <Link href={`${router.pathname}/${newsletter.id}`}>
                      {newsletter.id}
                    </Link>
                  </Td>
                  <Td>
                    <DatetimeUtc datetime={newsletter.createdAt} />
                  </Td>
                  <Td>
                    <DatetimeUtc datetime={newsletter.toSendAfter} />
                  </Td>
                  <Td>
                    {newsletter.isSending
                      ? "Sending..."
                      : newsletter.sentAt
                      ? "Sent"
                      : "Scheduled"}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colspan={4} className="text-center">
                  No data
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </main>
    </>
  )
}
