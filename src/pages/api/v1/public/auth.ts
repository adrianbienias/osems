import type { ApiResponse } from "@/libs/types"
import { handleDeleteAuth, handleGetAuth, handlePostAuth } from "@/modules/auth"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "POST": {
      return await handlePostAuth({ req, res })
    }
    case "GET": {
      return await handleGetAuth({ req, res })
    }
    case "DELETE": {
      return await handleDeleteAuth({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
