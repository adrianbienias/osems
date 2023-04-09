import { fetcher } from "@/libs/fetcher"
import { ListWithCount, ReactSelectOption } from "@/libs/types"
import { useRouter } from "next/router"
import { useState } from "react"
import Select from "react-select"
import useSWR from "swr"

export default function ListPicker() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<ReactSelectOption>(null)
  const { data, error, isLoading } = useSWR("/api/v1/lists", fetcher)
  const lists = data?.lists as ListWithCount[] | undefined

  function handleChange(selectedOption: ReactSelectOption) {
    setSelectedOption(selectedOption)
    router.push({ query: { listId: selectedOption?.value } })
  }

  if (error) {
    return (
      <div className="inline-block text-red-600 bg-red-50 border-solid border border-red-100 rounded py-2 px-3 mb-4">
        Failed to load list picker
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <div className="mb-0.5">
          <label htmlFor="list-select" className="text-sm text-slate-600">
            List:
          </label>
        </div>

        <Select
          instanceId="list-select"
          className="max-w-xs"
          isLoading={isLoading}
          isClearable={true}
          value={selectedOption}
          onChange={handleChange}
          options={
            lists &&
            lists.map((list) => ({
              value: list.id,
              label: `${list.name} (${list._count.contacts})`,
            }))
          }
        />
      </div>
    </>
  )
}
