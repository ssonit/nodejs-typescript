import { checkSchema } from 'express-validator'
import httpStatus from '~/constants/httpStatus'
import { messages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/errors'
import userService from '~/services/user.service'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        isString: true,
        trim: true,
        notEmpty: {
          errorMessage: messages.NAME_IS_REQUIRED
        }
      },
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
      },
      confirm_password: {
        isString: true,
        notEmpty: true,
        custom: {
          options: (value, { req }) => value === req.body.password,
          errorMessage: 'Passwords do not match'
        }
      },
      date_of_birth: {
        isISO8601: true
      }
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
            const result = await userService.findUserByEmail({ email: value, password: req.body.password })

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

            const decoded = await verifyToken({ token: access_token })
            req.decoded = decoded
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema({
    refresh_token: {
      notEmpty: {
        errorMessage: messages.REFRESH_TOKEN_REQUIRED
      },
      custom: {
        options: async (value, { req }) => {
          const decoded_refresh_token = await verifyToken({ token: value })
          return true
        }
      }
    }
  })
)
