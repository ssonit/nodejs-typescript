import { Request, Response } from 'express'
import { CreateBookmarkReqBody } from '~/models/requests/Bookmark.request'
import { TokenPayload } from '~/models/requests/User.request'
import bookmarkService from '~/services/bookmark.service'

export const createBookmarkController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body as CreateBookmarkReqBody

  const data = await bookmarkService.createBookmark({ user_id, tweet_id })

  return res.json({
    message: 'Bookmark created',
    data
  })
}
export const unBookmarkController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const { tweet_id } = req.params

  await bookmarkService.unBookmark({ user_id, tweet_id })

  return res.json({
    message: 'Unbookmark successfully'
  })
}
