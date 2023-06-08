import { getContacts } from "./contacts.model"

async function getContactsToExclude({
  listIdsToExclude,
}: {
  listIdsToExclude?: string[]
}) {
  let contactsToExclude = []
  if (listIdsToExclude) {
    for (const listIdToExclude of listIdsToExclude) {
      const contacts = await getContacts({ listId: listIdToExclude })
      if (contacts instanceof Error) {
        return Error(contacts.message)
      }

      const emails = contacts.map((contact) => ({
        email: contact.email,
      }))
      contactsToExclude.push(...emails)
    }
  }

  return contactsToExclude
}

export async function getContactsToSend({
  listId,
  listIdsToExclude,
}: {
  listId: string
  listIdsToExclude: string[]
}) {
  const contactsToInclude = await getContacts({ listId: listId })
  if (contactsToInclude instanceof Error) {
    console.error(contactsToInclude.message)

    return []
  }

  const contactsToExclude = await getContactsToExclude({ listIdsToExclude })
  if (contactsToExclude instanceof Error) {
    console.error(contactsToExclude.message)

    return []
  }

  const contactsToSend = contactsToInclude.filter((contactToInclude) => {
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

  return contactsToSend
}
