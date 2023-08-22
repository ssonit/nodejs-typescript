import { checkSchema } from 'express-validator'
import userService from '~/services/user.service'
import { validate } from '~/utils/validation'

export const registerValidator = validate(
  checkSchema({
    name: {
      in: 'body',
      isString: true,
      trim: true,
      notEmpty: true
    },
    email: {
      in: 'body',
      isEmail: true,
      trim: true,
      notEmpty: true,
      custom: {
        options: async (value) => {
          const result = await userService.checkEmailExists(value)

          if (result) {
            throw new Error('Email already exists')
          }
          return true
        }
      }
    },
    password: {
      in: 'body',
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
      in: 'body',
      isString: true,
      notEmpty: true,
      custom: {
        options: (value, { req }) => value === req.body.password,
        errorMessage: 'Passwords do not match'
      }
    },
    date_of_birth: {
      in: 'body',
      isISO8601: true
    }
  })
)
