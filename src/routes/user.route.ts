import { Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/user.controller'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/user.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const router = Router()

/**
 * path: /login
 * method: POST
 * Body: {email: string, password: string}
 *
 */

router.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * path: /register
 * method: POST
 * Body: {email: string, password: string, name: string, date_of_birth: string, confirm_password: string}
 *
 */
router.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * path: /logout
 * method: POST
 * body: {refresh_token: string}
 * headers: {'Authorization': 'Bearer ' + 'token'}
 */

router.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

export default router
