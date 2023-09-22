import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from './database.service'
import { ObjectId, WithId } from 'mongodb'

class BookmarkService {
  async createBookmark({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({
          user_id,
          tweet_id
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )

    return result.value as WithId<Bookmark>
  }
  async unBookmark({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
  }
}

const bookmarkService = new BookmarkService()

export default bookmarkService
