import { ObjectId } from 'mongodb'

interface BookmarkType {
  _id?: ObjectId
  tweet_id: string
  user_id: string
  created_at?: Date
}

export default class Bookmark {
  _id?: ObjectId
  tweet_id: ObjectId
  user_id: ObjectId
  created_at: Date
  constructor({ created_at, tweet_id, user_id, _id }: BookmarkType) {
    this._id = _id || new ObjectId()
    this.tweet_id = new ObjectId(tweet_id)
    this.user_id = new ObjectId(user_id)
    this.created_at = created_at || new Date()
  }
}
