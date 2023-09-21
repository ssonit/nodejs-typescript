import { Router } from 'express'
import { createTweetController } from '~/controllers/tweet.controller'
import { createTweetValidator } from '~/middlewares/tweet.middleware'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/user.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const router = Router()

router.use(accessTokenValidator, verifiedUserValidator)
router.post('/create', createTweetValidator, wrapRequestHandler(createTweetController))

export default router
