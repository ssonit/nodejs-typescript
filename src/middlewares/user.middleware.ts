import { ParamSchema, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import httpStatus from '~/constants/httpStatus'
import { messages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/errors'
import databaseService from '~/services/database.service'
import userService from '~/services/user.service'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
import { NextFunction, Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.request'
import { UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import { REGEX_USERNAME } from '~/constants/regex'

const passwordSchema: ParamSchema = {
  isString: true,
  notEmpty: true,
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage:
      'Password must be at least 6 characters long, at least 1 lowercase letter, at least 1 uppercase letter, at least 1 number and 1 symbols'
  }
}

const confirmPasswordSchema: ParamSchema = {
  isString: true,
  notEmpty: true,
  custom: {
    options: (value, { req }) => value === req.body.password,
    errorMessage: 'Passwords do not match'
  }
}

const nameSchema: ParamSchema = {
  isString: true,
  trim: true,
  notEmpty: {
    errorMessage: messages.NAME_IS_REQUIRED
  }
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  isString: true,
  notEmpty: true,
  trim: true
}

const followUserIdSchema: ParamSchema = {
  custom: {
    options: async (value: string) => {
      const follow = await databaseService.followers.findOne({
        _id: new ObjectId(value)
      })

      if (!follow) {
        throw new ErrorWithStatus({
          message: messages.USER_NOT_FOUND,
          status: httpStatus.NOT_FOUND
        })
      }
    }
  }
}

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: true,
        trim: true,
        notEmpty: true,
        custom: {
          options: async (value) => {
            const result = await userService.checkEmailExists(value)

            if (result) {
              throw new Error(messages.EMAIL_ALREADY_EXIST)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: true,
        trim: true,
        notEmpty: true,
        custom: {
          options: async (value, { req }) => {
            const result = await userService.findUserByEmailAndPassword({ email: value, password: req.body.password })

            if (!result) {
              throw new Error(messages.EMAIL_OR_PASSWORD_INCORRECT)
            }
            req.user = result
            return true
          }
        }
      },
      password: {
        isString: true,
        notEmpty: true,
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage:
            'Password must be at least 6 characters long, at least 1 lowercase letter, at least 1 uppercase letter, at least 1 number and 1 symbols'
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: messages.ACCESS_TOKEN_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: messages.ACCESS_TOKEN_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }

            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })

              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: httpStatus.UNAUTHORIZED
              })
            }

            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: messages.REFRESH_TOKEN_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (!refresh_token) {
                throw new ErrorWithStatus({
                  message: messages.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: messages.REFRESH_TOKEN_REQUIRED,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyEmailValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        notEmpty: {
          errorMessage: messages.EMAIL_VERIFY_TOKEN_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const decoded_email_verify_token = await verifyToken({
              token: value,
              privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
            })

            ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: true,
        trim: true,
        notEmpty: true
      }
    },
    ['body']
  )
)

export const forgotVerifyValidator = validate(
  checkSchema(
    {
      forgot_verify_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      forgot_verify_token: forgotPasswordTokenSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload

  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: messages.USER_NOT_VERIFIED,
        status: httpStatus.FORBIDDEN
      })
    )
  }

  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: false
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        isString: true,
        optional: true,
        isLength: {
          options: {
            max: 200,
            min: 1
          }
        },
        trim: true
      },
      location: {
        isString: true,
        optional: true,
        isLength: {
          options: {
            max: 200,
            min: 1
          }
        },
        trim: true
      },
      website: {
        isString: true,
        optional: true,
        isLength: {
          options: {
            max: 200,
            min: 1
          }
        },
        trim: true
      },
      username: {
        isString: true,
        optional: true,
        custom: {
          options: async (value: string) => {
            if (!REGEX_USERNAME.test(value)) {
              throw new Error(messages.USERNAME_INVALID)
            }

            const user = await databaseService.users.findOne({ username: value })
            if (user) {
              throw new Error(messages.USERNAME_EXISTS)
            }
            return true
          }
        },
        trim: true
      },
      avatar: {
        isString: true,
        optional: true,
        isLength: {
          options: {
            max: 200,
            min: 1
          }
        },
        trim: true
      },
      cover_photo: {
        isString: true,
        optional: true,
        isLength: {
          options: {
            max: 200,
            min: 1
          }
        },
        trim: true
      }
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: followUserIdSchema
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: followUserIdSchema
    },
    ['params']
  )
)

export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // req.header && req.headers

    // Không phân biệt hoa, thường
    // console.log(req.header('authorization'))

    // Phân biệt hoa, thường
    // console.log(req.headers.authorization) // Authorization

    if (req.headers.authorization) {
      return middleware(req, res, next)
    }

    next()
  }
}
