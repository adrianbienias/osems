import { getList } from "@/modules/lists"
import { Contact } from "@prisma/client"

export async function getContactsToExclude({
  listIdsToExclude,
}: {
  listIdsToExclude?: string[]
}) {
  let contactsToExclude = []

  if (listIdsToExclude) {
    for (const listIdToExclude of listIdsToExclude) {
      const list = await getList({ id: listIdToExclude })
      if (list instanceof Error) {
        return Error(list.message)
      }
      if (list === null) {
        continue
      }

      const emails = list.contacts.map((contact) => ({ email: contact.email }))
      contactsToExclude.push(...emails)
    }
  }

  return contactsToExclude
}

export function getContactsToSend({
  contactsToInclude,
  contactsToExclude,
}: {
  contactsToInclude: Contact[]
  contactsToExclude: { email: string }[]
}) {
  if (!contactsToInclude) {
    return []
  }

  return contactsToInclude.filter((contactToInclude) => {
    if (!contactToInclude.confirmedAt || contactToInclude.unsubscribedAt) {
      return false
    }

    const contactShouldBeExcluded = contactsToExclude.some(
      (contactToExclude) => contactToExclude.email === contactToInclude.email
    )
    if (contactShouldBeExcluded) {
      return false
    }

    return true
  })
}
