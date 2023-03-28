import ContactsTable from "@/components/contacts/contacts-table"
import ListPicker from "@/components/lists/list-picker"
import { Navbar } from "@/components/navbar"

export default function Contacts() {
  return (
    <>
      <Navbar />

      <main>
        <h2 className="mb-4">Contacts</h2>

        <ListPicker />
        <ContactsTable />
      </main>
    </>
  )
}
