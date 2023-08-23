import type { NextApiRequest, NextApiResponse } from "next"
import type { ApiResponse } from "@/libs/types"
import { handleGetContacts, handlePostContact } from "@/modules/contacts"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "GET": {
      return await handleGetContacts({ req, res })
    }
    case "POST": {
      return await handlePostContact({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
