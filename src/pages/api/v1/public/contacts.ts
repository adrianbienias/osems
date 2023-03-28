import { contactsGetHandler, contactsPostHandler } from "@/modules/contacts"
import Cors from "cors"
import { NextApiRequest, NextApiResponse } from "next"

// https://github.com/vercel/next.js/blob/canary/examples/api-routes-cors/pages/api/cors.ts
const cors = Cors({ methods: ["POST", "GET", "HEAD"] })

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  callbackFn: Function
) {
  return new Promise((resolve, reject) => {
    callbackFn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors)

  switch (req.method) {
    case "POST": {
      return contactsPostHandler(req, res)
    }
    case "GET": {
      return contactsGetHandler(req, res)
    }
    default: {
      return res.status(405).json({ error: "Method not allowed" })
    }
  }
}
