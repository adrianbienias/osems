import { ApiResponse } from "@/libs/types"
import { handleGetLists, handlePostList } from "@/modules/lists"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "POST": {
      return await handlePostList({ req, res })
    }
    case "GET": {
      return await handleGetLists({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
