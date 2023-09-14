import User from '~/models/schemas/User.schema'
import databaseService from './database.service'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { messages } from '~/constants/messages'
import Follower from '~/models/schemas/Follower.schema'
import axios from 'axios'
import { ErrorWithStatus } from '~/models/errors'
import httpStatus from '~/constants/httpStatus'
import { config } from 'dotenv'

type TPayload = {
  user_id: string
  verify: UserVerifyStatus
}

config()

class UserService {
  private generateAccessToken(payload: TPayload) {
    return signToken({
      payload: {
        user_id: payload.user_id,
        token_type: TokenType.AccessToken,
        verify: payload.verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRED_IN
      }
    })
  }
  private generateRefreshToken(payload: TPayload) {
    return signToken({
      payload: {
        user_id: payload.user_id,
        token_type: TokenType.RefreshToken,
        verify: payload.verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRED_IN
      }
    })
  }
  private generateVerifyEmailToken(payload: TPayload) {
    return signToken({
      payload: {
        user_id: payload.user_id,
        token_type: TokenType.EmailVerifyToken,
        verify: payload.verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRED_IN
      }
    })
  }
  private generateForgotPasswordToken(payload: TPayload) {
    return signToken({
      payload: {
        user_id: payload.user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify: payload.verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRED_IN
      }
    })
  }
  private signAccessAndRefreshToken(payload: TPayload) {
    return Promise.all([this.generateAccessToken(payload), this.generateRefreshToken(payload)])
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId().toString()

    const email_verify_token = await this.generateVerifyEmailToken({ user_id, verify: UserVerifyStatus.Unverified })

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

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })

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
  async login({ user_id, verify }: TPayload) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
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

  private async getOAuthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return data as {
      id_token: string
      access_token: string
    }
  }

  private async getGoogleUserInfo(id_token: string, access_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })

    return data as {
      id: string
      email: string
      email_verified: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async oauthGoogle(code: string) {
    const { id_token, access_token } = await this.getOAuthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(id_token, access_token)

    if (!userInfo.email_verified) {
      throw new ErrorWithStatus({
        message: 'Google email not verified',
        status: httpStatus.FORBIDDEN
      })
    }

    const user = await this.findUserByEmail(userInfo.email)

    if (user) {
      // nếu đã tồn tại user thì login

      const data = await this.login({ user_id: user._id.toString(), verify: user.verify })

      return {
        ...data,
        newUser: 0,
        verify: user.verify
      }
    } else {
      // không tồn tại thì đăng ký

      const password = Math.random().toString(36).substring(2, 15)

      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password
      })

      return {
        ...data,
        newUser: 1,
        verify: UserVerifyStatus.Unverified
      }
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
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
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

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user: new ObjectId(user_id),
        token: refresh_token
      })
    )

    return {
      access_token,
      refresh_token
    }
  }
  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.generateVerifyEmailToken({ user_id, verify: UserVerifyStatus.Unverified })
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
  async forgotPassword({ user_id, verify }: TPayload) {
    const forgot_verify_token = await this.generateForgotPasswordToken({ user_id, verify })

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

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id)
      },

      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_verify_token: 0
        }
      }
    )
    return user
  }

  async updateMe({ user_id, payload }: { user_id: string; payload: UpdateMeReqBody }) {
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...payload,
          date_of_birth: new Date(payload.date_of_birth as string)
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_verify_token: 0
        }
      }
    )

    return user.value
  }

  async follow(user_id: string, followed_user_id: string) {
    const follow = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follow)
      return {
        message: 'Followed user'
      }

    await databaseService.followers.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )

    return {
      message: 'Follow user success'
    }
  }

  async unfollow(user_id: string, followed_user_id: string) {
    const follow = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (!follow)
      return {
        message: 'Already unfollow'
      }

    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    return {
      message: 'Unfollow user success'
    }
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
