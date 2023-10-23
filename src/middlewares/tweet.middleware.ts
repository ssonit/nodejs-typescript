import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import httpStatus from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/errors'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.service'
import userService from '~/services/user.service'
import { wrapRequestHandler } from '~/utils/handlers'
import { numberEnumToArray } from '~/utils/utils'
import { validate } from '~/utils/validation'

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEET_MESSAGES.INVALID_TYPE
        }
      },
      audience: {
        isIn: {
          options: [tweetAudiences],
          errorMessage: TWEET_MESSAGES.INVALID_TYPE
        }
      },
      parent_id: {
        custom: {
          options: (value: string, { req }) => {
            const type = req.body.type as TweetType

            // Nếu type là retweet, comment, quotetweet thì parent_id phải là tweet_id của tweet cha
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_VALID_TWEET_ID)
            }

            // Nếu type là tweet thì parent_id là null

            if (type === TweetType.Tweet && value !== null) {
              throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }

            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value: string, { req }) => {
            const type = req.body.type as TweetType
            const mentions = req.body.mentions as string[]
            const hashtags = req.body.hashtags as string[]

            // Nếu type là comment, quotetweet, tweet và không có mentions và hashtags thì content phải là string và không được rỗng
            if (
              [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              isEmpty(mentions) &&
              isEmpty(hashtags) &&
              value === ''
            ) {
              throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
            }

            // Nếu type là retweet thì content là ''

            if (type === TweetType.Retweet && value !== '') {
              throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array là string
            if (value.some((item: any) => typeof item !== 'string')) {
              throw new Error('Hashtags must be a array string')
            }
            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array là string
            if (value.some((item: any) => !ObjectId.isValid(item))) {
              throw new Error('Mentions must be an array user id')
            }
            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value) => {
            // Yêu cầu mỗi phần tử trong array là Media object
            if (
              value.some((item: any) => {
                return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
              })
            ) {
              throw new Error('Medias must be an array Media object')
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: httpStatus.BAD_REQUEST,
                message: 'Invalid tweet id'
              })
            }
            // const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) })

            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags', // collection name
                    localFields: 'hashtags', // field in tweets
                    foreignFields: '_id',
                    as: 'hashtags'
                  }
                }
              ])
              .toArray()

            if (!tweet) {
              throw new ErrorWithStatus({
                status: httpStatus.NOT_FOUND,
                message: 'Tweet not found'
              })
            }

            ;(req as Request).tweet = tweet

            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.TweeterCircle) {
    // Kiểm tra ng dùng đã đăng nhập chưa
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: httpStatus.UNAUTHORIZED,
        message: 'Unauthorized'
      })
    }

    // Kiểm tra tác giả đăng tweet có bị khóa hay bị xóa không
    const author = await userService.findUserById(tweet.user_id.toString())

    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: httpStatus.NOT_FOUND,
        message: 'User not found'
      })
    }

    // Kiểm tra xem ng dùng này có nằm trong twitter circle của tác giả hay không
    const { user_id } = req.decoded_authorization
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))

    if (!isInTwitterCircle && !author._id.equals(user_id)) {
      throw new ErrorWithStatus({
        status: httpStatus.FORBIDDEN,
        message: 'Is not public'
      })
    }
  }

  next()
})
