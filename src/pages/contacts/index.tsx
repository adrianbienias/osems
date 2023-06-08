import ContactsTable from "@/components/contacts/contacts-table"
import ListPicker from "@/components/lists/list-picker"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { ReactSelectOption } from "@/libs/types"
import { useRouter } from "next/router"

export default function Contacts() {
  const router = useRouter()

  function onChange(selectedOption: ReactSelectOption) {
    if (selectedOption) {
      router.push({ query: { listId: selectedOption.value } })
    } else {
      router.push({ query: {} })
    }
  }

  return (
    <>
      <MetaHead title="Contacts" />

      <Navbar />

      <main>
        <h2 className="mb-4">Contacts</h2>

        <ListPicker onChange={onChange} />
        <ContactsTable />
      </main>
    </>
  )
}
