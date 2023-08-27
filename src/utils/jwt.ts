import { config } from 'dotenv'
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'

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
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) return reject(err)
      return resolve(token as string)
    })
  })
}

export const verifyToken = ({
  token,
  privateKey = process.env.JWT_SECRET as string
}: {
  token: string
  privateKey?: string
}) => {
  return new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, privateKey, (err, token) => {
      if (err) return reject(err)
      return resolve(token as JwtPayload)
    })
  })
}
