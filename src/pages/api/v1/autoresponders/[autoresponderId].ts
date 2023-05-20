import { ApiResponse } from "@/libs/types"
import { handleGetAutoresponder } from "@/modules/autoresponders"
import { handlePatchAutoresponder } from "@/modules/autoresponders/autoresponders.route"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "GET": {
      return await handleGetAutoresponder({ req, res })
    }
    case "PATCH": {
      return await handlePatchAutoresponder({ req, res })
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
