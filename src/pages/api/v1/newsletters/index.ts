import type { ApiResponse } from "@/libs/types"
import {
  handleGetNewsletters,
  handlePostNewsletter,
} from "@/modules/newsletters"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "POST": {
      return await handlePostNewsletter({ req, res })
    }
    case "GET": {
      return await handleGetNewsletters({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
