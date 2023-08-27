import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  user: ObjectId
  created_at?: Date
}

export default class RefreshToken {
  _id?: ObjectId
  token: string
  user: ObjectId
  created_at?: Date
  constructor(refreshToken: RefreshTokenType) {
    this._id = refreshToken._id
    this.token = refreshToken.token
    this.user = refreshToken.user
    this.created_at = refreshToken.created_at || new Date()
  }
}
