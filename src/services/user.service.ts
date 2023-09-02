import User from '~/models/schemas/User.schema'
import databaseService from './database.service'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { messages } from '~/constants/messages'

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
  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.generateAccessToken({ user_id }), this.generateRefreshToken({ user_id })])
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

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user: new ObjectId(user_id),
        token: refresh_token
      })
    )

    return {
      user_id,
      access_token,
      refresh_token
    }
  }
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user: new ObjectId(user_id),
        token: refresh_token
      })
    )

    return {
      user_id,
      access_token,
      refresh_token
    }
  }
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: messages.LOGOUT_SUCCESS
    }
  }
  async checkEmailExists(email: string) {
    const result = await databaseService.users.findOne({ email })
    return Boolean(result)
  }

  async findUserByEmail({ email, password }: { email: string; password: string }) {
    const result = await databaseService.users.findOne({ email, password: hashPassword(password) })

    return result
  }
}

const userService = new UserService()

export default userService
