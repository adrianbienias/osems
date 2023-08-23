import { List } from "@prisma/client"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import Select, { MultiValue, SingleValue } from "react-select"
import useSWR from "swr"
import { fetcher } from "@/libs/fetcher"

type ReactSelectOption =
  | MultiValue<{
      value: string
      label: string
    }>
  | SingleValue<{
      value: string
      label: string
    }>

export default function ListPicker({
  currentId,
  selectName = "listId",
  label = "List",
  isMulti = false,
  pushUrlQuery = false,
  isClearable = true,
}: {
  currentId?: string
  selectName?: string
  label?: string
  isMulti?: boolean
  pushUrlQuery?: boolean
  isClearable?: boolean
}) {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<ReactSelectOption>(null)
  const { data, error, isLoading } = useSWR("/api/v1/lists", fetcher)
  const lists = data?.lists as List[] | undefined
  const listOptions = useMemo(
    () =>
      lists?.map((list) => ({
        value: list.id,
        label: `${list.name}`,
      })),
    [lists]
  )

  useEffect(() => {
    if (!listOptions) return
    const setValue = listOptions.find(
      (item) => item.value === router.query.listId || item.value === currentId
    )
    if (!setValue) {
      setSelectedOption(null)
    } else {
      setSelectedOption(setValue)
    }
  }, [listOptions, router.query.listId, currentId])

  function handleChange(selectedOption: ReactSelectOption) {
    setSelectedOption(selectedOption)

    if (pushUrlQuery) {
      if (selectedOption && "value" in selectedOption) {
        router.push({ query: { listId: selectedOption.value } })
      } else {
        router.push({ query: {} })
      }
    }
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
          <label htmlFor="list-picker" className="text-sm text-slate-600">
            {label}
          </label>
        </div>

        <Select
          isMulti={isMulti}
          name={selectName}
          instanceId={`${selectName}-list-picker`}
          isLoading={isLoading}
          isClearable={isClearable}
          value={selectedOption}
          onChange={handleChange}
          options={listOptions}
        />
      </div>
    </>
  )
}
