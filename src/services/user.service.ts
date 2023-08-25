import User from '~/models/schemas/User.schema'
import databaseService from './database.service'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'

class UserService {
  private generateAccessToken(payload: { user_id: string }) {
    return signToken({
      payload: {
        user_id: payload.user_id,
        token_type: TokenType.AccessToken
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRED_IN
      }
    })
  }
  private generateRefreshToken(payload: { user_id: string }) {
    return signToken({
      payload: {
        user_id: payload.user_id,
        token_type: TokenType.RefreshToken
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRED_IN
      }
    })
  }
  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const user_id = result.insertedId.toString()

    const [access_token, refresh_token] = await Promise.all([
      this.generateAccessToken({ user_id }),
      this.generateRefreshToken({ user_id })
    ])

    return {
      user_id,
      access_token,
      refresh_token
    }
  }
  async checkEmailExists(email: string) {
    const result = await databaseService.users.findOne({ email })
    return Boolean(result)
  }
}

const userService = new UserService()

export default userService
