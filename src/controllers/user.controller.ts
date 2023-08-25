import { Request, Response } from 'express'
import { RegisterReqBody } from '~/models/requests/User.request'
import userService from '~/services/user.service'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  return res.status(200).json({ success: true })
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password, name, date_of_birth } = req.body as RegisterReqBody

  const result = await userService.register({ email, password, name, date_of_birth })

  return res.json({
    data: result,
    message: 'Register successfully'
  })
}
