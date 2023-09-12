import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import httpStatus from '~/constants/httpStatus'
import { messages } from '~/constants/messages'
import {
  ForgotPasswordReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'
import userService from '~/services/user.service'
import { verifyToken } from '~/utils/jwt'

export const loginController = async (req: Request, res: Response) => {
  const { _id, verify } = req.user as User
  const user_id = _id as ObjectId

  const result = await userService.login({ user_id: user_id.toString(), verify })

  return res.status(200).json({
    message: 'Login success',
    data: result
  })
}

export const registerController = async (req: Request, res: Response) => {
  const data = req.body as RegisterReqBody
  const result = await userService.register(data)

  return res.json({
    data: result,
    message: 'Register successfully'
  })
}

export const logoutController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body as LogoutReqBody

  const result = await userService.logout(refresh_token)

  return res.status(200).json({ message: result.message })
}

export const verifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload

  const user = await userService.findUserById(user_id)
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: messages.USER_NOT_FOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: messages.EMAIL_VERIFIED
    })
  }

  const result = await userService.verifyEmail(user_id)
  return res.json({
    message: messages.EMAIL_VERIFY_SUCCESS,
    data: result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const user = await userService.findUserById(user_id)

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: messages.USER_NOT_FOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: messages.EMAIL_VERIFIED
    })
  }

  await userService.resendVerifyEmail(user_id)

  return res.json({
    message: messages.RESEND_VERIFY_EMAIL_SUCCESS
  })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordReqBody
  const user = await userService.findUserByEmail(email)

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: messages.USER_NOT_FOUND
    })
  }

  const user_id = user._id.toString()
  const verify = user.verify

  await userService.forgotPassword({ user_id, verify })
  return res.json({
    message: messages.CHECK_EMAIL_TO_RESET_PASSWORD
  })
}

export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  const { forgot_verify_token } = req.body as VerifyForgotPasswordReqBody

  const decoded_verify_forgot_password = await verifyToken({
    token: forgot_verify_token,
    privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
  })

  const user_id = decoded_verify_forgot_password.user_id

  const user = await userService.findUserById(user_id)
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: messages.USER_NOT_FOUND
    })
  }

  if (user.forgot_verify_token !== forgot_verify_token) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: messages.FORGOT_VERIFY_TOKEN_INVALID
    })
  }

  return res.json({
    message: messages.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (req: Request, res: Response) => {
  const { forgot_verify_token, password } = req.body as ResetPasswordReqBody

  const decoded_verify_forgot_password = await verifyToken({
    token: forgot_verify_token,
    privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
  })

  const user_id = decoded_verify_forgot_password.user_id

  await userService.resetPassword(user_id, password)

  return res.json({
    message: messages.RESET_PASSWORD_SUCCESS
  })
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const user = await userService.getMe(user_id)

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: messages.USER_NOT_FOUND
    })
  }

  return res.json({ message: 'Get me success', data: user })
}

export const updateMeController = async (req: Request, res: Response) => {
  return res.json({
    message: 'Update me success'
  })
}
