import { LinkButton } from "@/components/button"
import { DatetimeUtc } from "@/components/datetime-utc"
import { Navbar } from "@/components/navbar"
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/table"
import { fetcher } from "@/libs/fetcher"
import { StringValues } from "@/libs/types"
import { NewsletterWithTemplate } from "@/modules/newsletters"
import Link from "next/link"
import { useRouter } from "next/router"
import useSWR from "swr"

export default function Newsletters() {
  const router = useRouter()
  const { data, error, isLoading } = useSWR("/api/v1/newsletters", fetcher)
  const newsletters = data?.newslettersWithTemplate as StringValues<
    NewsletterWithTemplate[] | undefined
  >

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
              <Th>Subject</Th>
              <Th>Created at</Th>
              <Th>Scheduled to send at</Th>
              <Th>Sent at</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {newsletters && newsletters.length > 0 ? (
              newsletters.map((newsletter) => (
                <Tr key={newsletter.id}>
                  <Td>
                    <Link href={`${router.pathname}/${newsletter.id}`}>
                      {newsletter.template.subject}
                    </Link>
                  </Td>
                  <Td>
                    <DatetimeUtc datetime={newsletter.createdAt} />
                  </Td>
                  <Td>
                    <DatetimeUtc datetime={newsletter.toSendAfter} />
                  </Td>
                  <Td>
                    {newsletter.sentAt ? (
                      <DatetimeUtc datetime={newsletter.sentAt} />
                    ) : (
                      "N/A"
                    )}
                  </Td>
                  <Td>{newsletter.sentAt ? "Sent" : "Scheduled"}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={4} className="text-center">
                  {isLoading && <span>Loading...</span>}
                  {error && <span>Failed to load</span>}
                  {newsletters?.length === 0 && <span>No data</span>}
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </main>
    </>
  )
}
