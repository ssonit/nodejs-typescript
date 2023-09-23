import { Router } from 'express'
import { createTweetController, getTweetDetailController } from '~/controllers/tweet.controller'
import { createTweetValidator, tweetIdValidator } from '~/middlewares/tweet.middleware'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/user.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const router = Router()

// router.use(accessTokenValidator, verifiedUserValidator)
router.post('/create', createTweetValidator, wrapRequestHandler(createTweetController))
router.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(getTweetDetailController)
)

export default router
