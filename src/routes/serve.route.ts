import { Router } from 'express'
import { serveImageController, serveVideoController } from '~/controllers/serve.controller'

const router = Router()

router.get('/image/:name', serveImageController)

router.get('/video/:name', serveVideoController)

export default router
