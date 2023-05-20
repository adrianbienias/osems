import AutorespondersTable from "@/components/autoresponders/autoresponders-table"
import { LinkButton } from "@/components/button"
import ListPicker from "@/components/lists/list-picker"
import { Navbar } from "@/components/navbar"
import { ReactSelectOption } from "@/libs/types"
import { useRouter } from "next/router"

export default function Autoresponders() {
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
      <Navbar />

      <main>
        <h2 className="mb-4">Autoresponders</h2>
        <p>
          <LinkButton href="/autoresponders/add">
            Add new autoresponder
          </LinkButton>
        </p>

        <ListPicker onChange={onChange} />
        <AutorespondersTable />
      </main>
    </>
  )
}
