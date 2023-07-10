import { ErrorMsg } from "@/components/alert"
import { Button, LinkButton } from "@/components/button"
import ListPicker from "@/components/lists/list-picker"
import MetaHead from "@/components/meta-head"
import { Navbar } from "@/components/navbar"
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/table"
import { fetcher } from "@/libs/fetcher"
import type { StringValues } from "@/libs/types"
import type { ContactWithList } from "@/modules/contacts"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import useSWR from "swr"

export default function Contacts() {
  const router = useRouter()
  const listId = router.query.listId
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/contacts?listId=${listId}`,
    fetcher
  )
  const contacts = data?.contacts as StringValues<ContactWithList[]> | undefined

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleFormSubmit = async function (event: React.SyntheticEvent) {
    event.preventDefault()
    const form = event.target as HTMLFormElement

    setIsSubmitted(true)
    setIsSuccess(false)

    const formData = new FormData(form)
    const csvFile = formData.get("csvFile")
    const response = await fetch(`/api/v1/contacts/upload`, {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: csvFile,
    })

    const { error } = await response.json()
    if (error) {
      setErrorMsg(error)
      setIsSubmitted(false)
      return
    }

    setErrorMsg("")
    setIsSubmitted(false)
    setIsSuccess(true)
    setTimeout(() => setIsSuccess(false), 1500)

    form.csvFile.value = "" // Clears upload input field

    mutate()
  }

  return (
    <>
      <MetaHead title="Contacts" />

      <Navbar />

      <main>
        <h2 className="mb-4">Contacts</h2>

        <div className="flex justify-between flex-col gap-4 md:flex-row">
          <p className="my-0">
            <LinkButton href="/contacts/add">Add new contact</LinkButton>
          </p>

          <form
            onSubmit={handleFormSubmit}
            className="inline-flex flex-col items-end"
          >
            <fieldset disabled={isSubmitted}>
              <input
                className="text-slate-600 rounded cursor-pointer bg-slate-100 mr-4 hover:bg-slate-200 text-base file:bg-none file:border-none file:bg-blue-500 file:hover:bg-blue-600 file:text-white file:px-4 file:py-2 file:text-base file:mr-3 file:cursor-pointer"
                aria-label="Upload file"
                id="file-input"
                type="file"
                name="csvFile"
              />

              <Button
                type="submit"
                isLoading={isSubmitted}
                isSuccess={isSuccess}
              >
                Add from CSV
              </Button>
            </fieldset>
            <ErrorMsg errorMsg={errorMsg} />
          </form>
        </div>

        <ListPicker pushUrlQuery={true} />

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
                  <Td>
                    <Link href={`contacts/${contact.id}`}>{contact.email}</Link>
                  </Td>
                  <Td>
                    <Link href={`lists/${contact.list.id}`}>
                      {contact.list.name}
                    </Link>
                  </Td>
                  <Td>{new Date(contact.createdAt).toLocaleString()}</Td>
                  <Td>
                    {contact.confirmedAt
                      ? new Date(contact.confirmedAt).toLocaleString()
                      : "N/A"}
                  </Td>
                  <Td>
                    {contact.unsubscribedAt
                      ? new Date(contact.unsubscribedAt).toLocaleString()
                      : "N/A"}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} className="text-center">
                  {error && <span>Failed to load</span>}
                  {isLoading && <span>Loading...</span>}
                  {contacts?.length === 0 && <span>No data</span>}
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </main>
    </>
  )
}
