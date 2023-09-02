import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { LogoutReqBody, RegisterReqBody } from '~/models/requests/User.request'
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
  const { email, password, name, date_of_birth } = req.body as RegisterReqBody

  const result = await userService.register({ email, password, name, date_of_birth })

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
