import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.service'
import userService from '~/services/user.service'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  return res.status(200).json({ success: true })
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const result = await userService.register({ email, password })

    return res.json({
      data: result,
      message: 'Register successfully'
    })
  } catch (error) {
    return res.status(400).json({ message: 'Registration failed', error })
  }
}
