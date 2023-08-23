import type { NextApiRequest, NextApiResponse } from "next"
import type { ApiResponse } from "@/libs/types"
import { handleGetNewsletter } from "@/modules/newsletters"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "GET": {
      return await handleGetNewsletter({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
