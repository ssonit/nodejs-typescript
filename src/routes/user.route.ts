import { Router } from 'express'
import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/user.controller'
import {
  accessTokenValidator,
  emailValidator,
  forgotVerifyValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
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

/**
 * path: /resend-verify-email
 * method: POST
 * body: { }
 * headers: {'Authorization': 'Bearer ' + 'token'}
 */

router.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * path: /forgot-password
 * method: POST
 * body: { email: string }
 *
 */

router.post('/forgot-password', emailValidator, wrapRequestHandler(forgotPasswordController))

/**
 * path: /verify-forgot-password
 * method: POST
 * body: { forgot_verify_token: string }
 *
 */

router.post('/verify-forgot-password', forgotVerifyValidator, wrapRequestHandler(verifyForgotPasswordController))

/**
 * path: /verify-forgot-password
 * method: POST
 * body: { forgot_verify_token: string, password: string, confirm_password: string }
 *
 */

router.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

export default router
