import { Request, Response } from 'express'

export const createTweetController = async (req: Request, res: Response) => {
  return res.json('success')
}
