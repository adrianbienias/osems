import type { ApiResponse } from "@/libs/types"
import { handleGetList, handlePatchList } from "@/modules/lists"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "PATCH": {
      return await handlePatchList({ req, res })
    }
    case "GET": {
      return await handleGetList({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
