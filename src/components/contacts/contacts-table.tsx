import { DatetimeUtc } from "@/components/datetime-utc"
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/table"
import { fetcher } from "@/libs/fetcher"
import { ContactWithList, StringValues } from "@/libs/types"
import Link from "next/link"
import { useRouter } from "next/router"
import useSWR from "swr"

export default function ContactsTable() {
  const router = useRouter()
  const { data, error, isLoading } = useSWR(
    `/api/v1/contacts?listId=${router.query.listId}`,
    fetcher
  )
  const contacts = data?.contacts as StringValues<ContactWithList[]> | undefined

  return (
    <>
      <Table>
        <Thead>
          <Tr>
            <Th>No.</Th>
            <Th>Email</Th>
            <Th>List</Th>
            <Th>Created at</Th>
            <Th>Confirmed at</Th>
            <Th>Unsubscribed at</Th>
          </Tr>
        </Thead>
        <Tbody>
          {contacts && contacts.length > 0 ? (
            contacts.map((contact, index) => (
              <Tr key={`${contact.email}-${contact.listId}`}>
                <Td>{index + 1}</Td>
                <Td>{contact.email}</Td>
                <Td>
                  <Link href={`lists/${contact.list.id}`}>
                    {contact.list.name}
                  </Link>
                </Td>
                <Td>
                  <DatetimeUtc datetime={contact.createdAt} />
                </Td>
                <Td>
                  <DatetimeUtc datetime={contact.confirmedAt} />
                </Td>
                <Td>
                  <DatetimeUtc datetime={contact.unsubscribedAt} />
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={6} className="text-center">
                {error && <span>Failed to load</span>}
                {isLoading && <span>Loading...</span>}
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </>
  )
}
