import Link from "next/link"
import { useRouter } from "next/router"
import useSWR from "swr"
import { LinkButton } from "@/components/button"
import ListPicker from "@/components/lists/list-picker"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/table"
import { fetcher } from "@/libs/fetcher"
import type { StringValues } from "@/libs/types"
import type { AutoresponderWithListAndTemplate } from "@/modules/autoresponders"

export default function Autoresponders() {
  const router = useRouter()
  const listId = router.query.listId
  const { data, error, isLoading } = useSWR(
    `/api/v1/autoresponders?listId=${listId}`,
    fetcher
  )
  const autoresponders = data?.autoresponders as
    | StringValues<AutoresponderWithListAndTemplate[]>
    | undefined

  return (
    <>
      <MetaHead title="Autoresponders" />

      <Navbar />

      <main>
        <h2 className="mb-4">Autoresponders</h2>
        <p>
          <LinkButton href="/autoresponders/add">
            Add new autoresponder
          </LinkButton>
        </p>

        <ListPicker pushUrlQuery={true} />

        <Table>
          <Thead>
            <Tr>
              <Th>No.</Th>
              <Th>Subject</Th>
              <Th>Delay days</Th>
              <Th>List</Th>
              <Th>Created at</Th>
            </Tr>
          </Thead>
          <Tbody>
            {autoresponders && autoresponders.length > 0 ? (
              autoresponders.map((autoresponder, index) => (
                <Tr key={`${autoresponder.id}`}>
                  <Td>{index + 1}</Td>
                  <Td>
                    <Link href={`autoresponders/${autoresponder.id}`}>
                      {autoresponder.template.subject}
                    </Link>
                  </Td>
                  <Td>{autoresponder.delayDays}</Td>
                  <Td>
                    <Link href={`lists/${autoresponder.listId}`}>
                      {autoresponder.list.name}
                    </Link>
                  </Td>
                  <Td>{new Date(autoresponder.createdAt).toLocaleString()}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} className="text-center">
                  {error && <span>Failed to load</span>}
                  {isLoading && <span>Loading...</span>}
                  {autoresponders?.length === 0 && <span>No data</span>}
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </main>
    </>
  )
}
