import { LinkButton } from "@/components/button"
import { DatetimeUtc } from "@/components/datetime-utc"
import { Navbar } from "@/components/navbar"
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/table"
import { fetcher } from "@/libs/fetcher"
import { ListWithCount, StringValues } from "@/libs/types"
import Link from "next/link"
import { useRouter } from "next/router"
import useSWR from "swr"

export default function Lists() {
  const router = useRouter()
  const { data, error, isLoading } = useSWR("/api/v1/lists", fetcher)
  const lists = data?.lists as StringValues<ListWithCount[]> | undefined

  return (
    <>
      <Navbar />

      <main>
        <h2 className="mb-4">Lists</h2>
        <p>
          <LinkButton href="/lists/add">Add new list</LinkButton>
        </p>

        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Contacts</Th>
              <Th>Created at</Th>
            </Tr>
          </Thead>
          <Tbody>
            {lists && lists.length > 0 ? (
              lists.map((list) => (
                <Tr key={list.id}>
                  <Td>
                    <Link href={`${router.pathname}/${list.id}`}>
                      {list.name}
                    </Link>
                  </Td>
                  <Td>{list._count.contacts}</Td>
                  <Td>
                    <DatetimeUtc datetime={list.createdAt} />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={3} className="text-center">
                  {isLoading && <span>Loading...</span>}
                  {error && <span>Failed to load</span>}
                  {lists?.length === 0 && <span>No data</span>}
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </main>
    </>
  )
}
