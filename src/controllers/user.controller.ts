import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import httpStatus from '~/constants/httpStatus'
import { messages } from '~/constants/messages'
import { LogoutReqBody, RegisterReqBody, TokenPayload } from '~/models/requests/User.request'
import userService from '~/services/user.service'

export const loginController = async (req: Request, res: Response) => {
  const user_id = req.user?._id as ObjectId

  const result = await userService.login(user_id.toString())

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
