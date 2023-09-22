import { Router } from 'express'
import { createBookmarkController, unBookmarkController } from '~/controllers/bookmark.controller'
import { createBookmarkValidator } from '~/middlewares/bookmark.middleware'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/user.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const router = Router()

router.post(
  '/create',
  accessTokenValidator,
  verifiedUserValidator,
  createBookmarkValidator,
  wrapRequestHandler(createBookmarkController)
)

router.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(unBookmarkController)
)

export default router
