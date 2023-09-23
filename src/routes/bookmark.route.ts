import { Router } from 'express'
import { createBookmarkController, unBookmarkController } from '~/controllers/bookmark.controller'
import { tweetIdValidator } from '~/middlewares/tweet.middleware'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/user.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const router = Router()

router.post(
  '/create',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(createBookmarkController)
)

router.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarkController)
)

export default router
