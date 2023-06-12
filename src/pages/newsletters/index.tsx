import { LinkButton } from "@/components/button"
import ListPicker from "@/components/lists/list-picker"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/table"
import { fetcher } from "@/libs/fetcher"
import type { StringValues } from "@/libs/types"
import { NewsletterWithListAndTemplate } from "@/modules/newsletters"
import Link from "next/link"
import { useRouter } from "next/router"
import useSWR from "swr"

export default function Newsletters() {
  const router = useRouter()
  const listId = router.query.listId
  const { data, error, isLoading } = useSWR(
    `/api/v1/newsletters?listId=${listId}`,
    fetcher
  )
  const newsletters = data?.newslettersWithTemplate as StringValues<
    NewsletterWithListAndTemplate[] | undefined
  >

  return (
    <>
      <MetaHead title="Newsletters" />

      <Navbar />

      <main>
        <h2 className="mb-4">Newsletters</h2>
        <p>
          <LinkButton href="/newsletters/add">
            Schedule new newsletter
          </LinkButton>
        </p>

        <ListPicker pushUrlQuery={true} />

        <Table>
          <Thead>
            <Tr>
              <Th>No.</Th>
              <Th>Subject</Th>
              <Th>List</Th>
              <Th>Scheduled to send at</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {newsletters && newsletters.length > 0 ? (
              newsletters.map((newsletter, index) => (
                <Tr key={newsletter.id}>
                  <Td>{index + 1}</Td>
                  <Td>
                    <Link href={`${router.pathname}/${newsletter.id}`}>
                      {newsletter.template.subject}
                    </Link>
                  </Td>
                  <Td>
                    <Link href={`lists/${newsletter.listId}`}>
                      {newsletter.list.name}
                    </Link>
                  </Td>
                  <Td>{new Date(newsletter.toSendAfter).toLocaleString()}</Td>
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
