import { DatetimeUtc } from "@/components/datetime-utc"
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/table"
import { StringValues } from "@/libs/types"
import { Contact, List } from "@prisma/client"

type Props = {
  list: List & {
    contacts: StringValues<Contact[]>
  }
}

export default function Contacts({ list }: Props) {
  return (
    <>
      <section>
        <h2>Contacts</h2>

        <Table>
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Created at</Th>
              <Th>Confirmed at</Th>
              <Th>Unsubscribed at</Th>
            </Tr>
          </Thead>
          <Tbody>
            {list.contacts.length > 0 ? (
              list.contacts.map((contact, index) => (
                <Tr key={index}>
                  <Td>{contact.email}</Td>
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
                <Td colspan={4} className="text-center">
                  No data
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </section>
    </>
  )
}
