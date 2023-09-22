import { MongoClient, Db, Collection } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import HashTag from '~/models/schemas/Hashtag.schema'

config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.koejvi9.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })

      console.log('Connection successfully')
    } catch (err) {
      console.log('Connection failed')
      throw err
    }
  }

  async indexUsers() {
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])

    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }) // unique: true
    }
  }

  async indexRefreshTokens() {
    const exists = await this.users.indexExists(['token_1', 'exp_1'])
    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 }, { unique: true })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }

  async indexFollowers() {
    const exists = await this.users.indexExists(['user_id_1_followed_user_id_1'])
    if (!exists) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  get users(): Collection<User> {
    return this.db.collection('users')
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection('refreshTokens')
  }
  get followers(): Collection<Follower> {
    return this.db.collection('followers')
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection('tweets')
  }
  get hashtags(): Collection<HashTag> {
    return this.db.collection('hashtags')
  }
}

const databaseService = new DatabaseService()

export default databaseService
