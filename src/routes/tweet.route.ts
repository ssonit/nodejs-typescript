import { Router } from 'express'
import { createTweetController, getTweetDetailController } from '~/controllers/tweet.controller'
import { audienceValidator, createTweetValidator, tweetIdValidator } from '~/middlewares/tweet.middleware'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/user.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const router = Router()

// router.use(accessTokenValidator, verifiedUserValidator)
router.post('/create', createTweetValidator, wrapRequestHandler(createTweetController))

// không đăng nhập cũng có thể xem get tweet
router.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetDetailController)
)

export default router
