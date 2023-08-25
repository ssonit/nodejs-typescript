import { Router } from 'express'
import { loginController, registerController } from '~/controllers/user.controller'
import { registerValidator } from '~/middlewares/user.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const router = Router()

router.post('/login', loginController)
router.post('/register', registerValidator, wrapRequestHandler(registerController))

export default router
