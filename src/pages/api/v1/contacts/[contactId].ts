import type { ApiResponse } from "@/libs/types"
import { handleGetContact, handlePatchContact } from "@/modules/contacts"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "GET": {
      return await handleGetContact({ req, res })
    }
    case "PATCH": {
      return await handlePatchContact({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
