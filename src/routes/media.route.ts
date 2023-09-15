import { Router } from 'express'
import { uploadImageController } from '~/controllers/media.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const router = Router()

router.post('/upload-image', wrapRequestHandler(uploadImageController))

export default router
