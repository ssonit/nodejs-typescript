import { createHash } from 'crypto'

function sha256(str: string) {
  return createHash('sha256').update(str).digest('hex')
}

export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
