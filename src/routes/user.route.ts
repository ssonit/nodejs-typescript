import { Router } from 'express'
import { loginController, registerController } from '~/controllers/user.controller'
import { loginValidator, registerValidator } from '~/middlewares/user.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const router = Router()

router.post('/login', loginValidator, wrapRequestHandler(loginController))
router.post('/register', registerValidator, wrapRequestHandler(registerController))

export default router
