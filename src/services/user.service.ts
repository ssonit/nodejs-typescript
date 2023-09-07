import User from '~/models/schemas/User.schema'
import databaseService from './database.service'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
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
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
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
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRED_IN
      }
    })
  }
  private generateVerifyEmailToken(payload: { user_id: string }) {
    return signToken({
      payload: {
        user_id: payload.user_id,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRED_IN
      }
    })
  }
  private generateForgotPasswordToken(payload: { user_id: string }) {
    return signToken({
      payload: {
        user_id: payload.user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRED_IN
      }
    })
  }
  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.generateAccessToken({ user_id }), this.generateRefreshToken({ user_id })])
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId().toString()

    const email_verify_token = await this.generateVerifyEmailToken({ user_id })

    console.log('Gửi email xác thực cho người dùng ', email_verify_token, user_id)

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: new ObjectId(user_id),
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        email_verify_token
      })
    )

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
  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])

    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }
  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.generateVerifyEmailToken({ user_id })
    console.log('Gửi lại email với email verify token mới', email_verify_token)

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }
  async forgotPassword(user_id: string) {
    const forgot_verify_token = await this.generateForgotPasswordToken({ user_id })

    console.log('Gửi email cho user', forgot_verify_token)

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password),
          forgot_verify_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  async checkEmailExists(email: string) {
    const result = await databaseService.users.findOne({ email })
    return Boolean(result)
  }

  async findUserById(user_id: string) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    return user
  }

  async findUserByEmail(email: string) {
    const result = await databaseService.users.findOne({ email })

    return result
  }
  async findUserByEmailAndPassword({ email, password }: { email: string; password: string }) {
    const result = await databaseService.users.findOne({ email, password: hashPassword(password) })

    return result
  }
}

const userService = new UserService()

export default userService
