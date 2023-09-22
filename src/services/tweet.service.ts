import { TweetReqBody } from '~/models/requests/Tweet.request'
import databaseService from './database.service'
import Tweet from '~/models/schemas/Tweet.schema'
import HashTag from '~/models/schemas/Hashtag.schema'
import { WithId } from 'mongodb'

class TweetService {
  async checkAndCreateHashTags(hashtags: string[]) {
    // findOneAndUpdate phải truyền _id vào chứ nó không tự tạo _id

    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag: string) => {
        return databaseService.hashtags.findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: new HashTag({
              name: hashtag
            })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return hashtagDocuments.map((hashtag) => (hashtag.value as WithId<HashTag>)._id)
  }
  async createTweet({ body, user_id }: { body: TweetReqBody; user_id: string }) {
    const hashtags = await this.checkAndCreateHashTags(body.hashtags)

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id
      })
    )

    const tweet = await databaseService.tweets.findOne({
      _id: result.insertedId
    })

    return tweet
  }
}

const tweetService = new TweetService()

export default tweetService
