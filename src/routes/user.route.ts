import { Router } from 'express'
import {
  loginController,
  logoutController,
  registerController,
  verifyEmailController
} from '~/controllers/user.controller'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyEmailValidator
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

/**
 * path: /verify-email
 * method: POST
 * body: { email_verify_token: string }
 */

router.post('/verify-email', verifyEmailValidator, wrapRequestHandler(verifyEmailController))

export default router
