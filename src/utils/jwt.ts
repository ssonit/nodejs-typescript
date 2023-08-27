import { config } from 'dotenv'
import jwt, { SignOptions } from 'jsonwebtoken'

config()

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = {
    expiresIn: '1d'
  }
}: {
  payload: any
  privateKey?: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    return jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) return reject(err)
      return resolve(token as string)
    })
  })
}
