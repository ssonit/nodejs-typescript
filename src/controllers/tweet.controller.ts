import { Request, Response } from 'express'
import { TweetReqBody } from '~/models/requests/Tweet.request'
import { TokenPayload } from '~/models/requests/User.request'
import tweetService from '~/services/tweet.service'

export const createTweetController = async (req: Request, res: Response) => {
  const body = req.body as TweetReqBody
  const { user_id } = req.decoded_authorization as TokenPayload

  const data = await tweetService.createTweet({ body, user_id })

  return res.json({
    message: 'Tweet created successfully',
    data
  })
}
export const getTweetDetailController = async (req: Request, res: Response) => {
  return res.json({
    message: 'Tweet created successfully',
    data: ''
  })
}
