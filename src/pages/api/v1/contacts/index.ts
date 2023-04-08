import { ApiResponse } from "@/libs/types"
import { filterContacts } from "@/modules/contacts"
import { Contact } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
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
  res: NextApiResponse<ApiResponse & { contacts?: Contact[] }>
}) {
  let listId = req.query.listId as string | undefined
  if (listId === "undefined" || listId === "") {
    listId = undefined
  }

  const contacts = await filterContacts({ listId })
  if (contacts instanceof Error) {
    return res.status(400).json({ error: contacts.message })
  }

  return res.status(200).json({ success: "Ok", contacts })
}
