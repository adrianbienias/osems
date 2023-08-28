import { Contact, getContacts } from "./contacts.model"

async function getContactsToExclude({
  listIdsToExclude,
}: {
  listIdsToExclude: string[]
}) {
  const contactsToExclude: Contact[] = []
  for (const listIdToExclude of listIdsToExclude) {
    contactsToExclude.push(...(await getContacts({ listId: listIdToExclude })))
  }

  return contactsToExclude
}

function contactShouldBeExcluded({
  contactsToExclude,
  contactToInclude,
}: {
  contactsToExclude: Contact[]
  contactToInclude: Contact
}) {
  return contactsToExclude.some(
    (contactToExclude) => contactToExclude.email === contactToInclude.email
  )
}

export async function getContactsToSend({
  listId,
  listIdsToExclude,
}: {
  listId: string
  listIdsToExclude: string[]
}) {
  const contactsToInclude = await getContacts({ listId: listId })
  const contactsToExclude = await getContactsToExclude({ listIdsToExclude })

  return contactsToInclude.filter((contactToInclude) => {
    if (!contactToInclude.confirmedAt || contactToInclude.unsubscribedAt) {
      return false
    }
    if (contactShouldBeExcluded({ contactsToExclude, contactToInclude })) {
      return false
    }

    return true
  })
}
