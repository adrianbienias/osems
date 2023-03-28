import { getContacts } from "@/modules/contacts"
import { Contact } from "@prisma/client"
import type { NextApiRequest, NextApiResponse } from "next"

type Response = {
  error?: string
  success?: string
  contacts?: Contact[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  switch (req.method) {
    case "GET": {
      return await handleGetContacts({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}

async function handleGetContacts({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse<Response>
}) {
  let listId = req.query.listId as string | undefined
  if (listId === "undefined" || listId === "") {
    listId = undefined
  }

  const contacts = await getContacts({ listId })
  if (contacts instanceof Error) {
    return res.status(400).json({ error: contacts.message })
  }

  return res.status(200).json({ success: "Ok", contacts })
}
