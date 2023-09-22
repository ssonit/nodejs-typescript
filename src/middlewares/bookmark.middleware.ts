import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { TokenPayload } from '~/models/requests/User.request'
import databaseService from '~/services/database.service'
import { validate } from '~/utils/validation'

export const createBookmarkValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) })

            if (!tweet) {
              throw new Error('Tweet not found')
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)
