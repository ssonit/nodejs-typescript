import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '~/constants/types'

export interface TweetReqBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[] // ['react', 'elonmusk']
  mentions: string[] // user_id[]
  medias: Media[]
}
