import { Router } from 'express'
import { loginController, registerController } from '~/controllers/user.controller'
import { registerValidator } from '~/middlewares/user.middleware'

const router = Router()

router.post('/login', loginController)
router.post('/register', registerValidator, registerController)

export default router
