import { NextApiRequest, NextApiResponse } from "next"
import {
  createMocks,
  createRequest,
  createResponse,
  RequestOptions,
} from "node-mocks-http"

export function mockRequestResponse(reqOptions: RequestOptions) {
  const {
    req,
    res,
  }: {
    req: NextApiRequest & ReturnType<typeof createRequest>
    res: NextApiResponse & ReturnType<typeof createResponse>
  } = createMocks(reqOptions)

  return { req, res }
}
