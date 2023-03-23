import Contacts from "@/components/lists/contacts"
import Details from "@/components/lists/details"
import ListSignup from "@/components/lists/list-signup"
import { Navbar } from "@/components/navbar"
import { fetcher } from "@/libs/fetcher"
import { StringValues } from "@/libs/types"
import { Contact, List, Template } from "@prisma/client"
import { useRouter } from "next/router"
import useSWR from "swr"

export default function ListWithContacts() {
  const router = useRouter()
  const { listId } = router.query

  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/lists/${listId}`,
    fetcher
  )

  const list = data?.list as
    | (List & { contacts: StringValues<Contact[]> })
    | undefined

  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  if (!list) return <div>No data</div>

  const confirmationTemplate = data?.confirmationTemplate as Template

  return (
    <>
      <Navbar />

      <main>
        <div className="mt-8 flex flex-col md:flex-row gap-8 justify-between">
          <Details
            list={list}
            confirmationTemplate={confirmationTemplate}
            mutate={mutate}
          />
        </div>

        <div className="my-16">
          <Contacts list={list} />
        </div>

        <div className="my-16">
          <ListSignup list={list} />
        </div>
      </main>
    </>
  )
}
