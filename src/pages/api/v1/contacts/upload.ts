import type { NextApiRequest, NextApiResponse } from "next"
import type { ApiResponse } from "@/libs/types"
import { handlePostUploadContacts } from "@/modules/contacts"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "POST": {
      return await handlePostUploadContacts({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
