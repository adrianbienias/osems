import type { NextApiRequest, NextApiResponse } from "next"
import type { ApiResponse } from "@/libs/types"
import {
  handleGetAutoresponders,
  handlePostAutoresponders,
} from "@/modules/autoresponders"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "POST": {
      return await handlePostAutoresponders({ req, res })
    }
    case "GET": {
      return await handleGetAutoresponders({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
