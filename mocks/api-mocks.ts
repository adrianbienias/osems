import type { NextApiRequest, NextApiResponse } from "next"
import type { RequestOptions } from "node-mocks-http"
import { createMocks, createRequest, createResponse } from "node-mocks-http"

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
