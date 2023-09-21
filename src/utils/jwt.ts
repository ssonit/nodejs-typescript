import { config } from 'dotenv'
import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.request'

config()

export const signToken = ({
  payload,
  privateKey,
  options = {}
}: {
  payload: any
  privateKey: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    // if (payload.exp) {
    //   delete options.expiresIn
    // }
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) return reject(err)
      return resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, privateKey }: { token: string; privateKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, privateKey, (err, token) => {
      if (err) return reject(err)
      return resolve(token as TokenPayload)
    })
  })
}
