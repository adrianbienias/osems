import type { NextApiRequest, NextApiResponse } from "next"
import type { ApiResponse } from "@/libs/types"
import { sendAutoresponders } from "@/modules/autoresponders"
import { sendNewsletters } from "@/modules/newsletters"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  switch (req.method) {
    case "GET": {
      switch (req.query.type) {
        case "autoresponder": {
          await sendAutoresponders()

          return res
            .status(200)
            .json({ success: "Sending autoresponders has been triggered" })
        }
        case "newsletter": {
          await sendNewsletters()

          return res
            .status(200)
            .json({ success: "Sending newsletters has been triggered" })
        }
        default: {
          return res.status(300).json({ error: "Unknown type" })
        }
      }
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
