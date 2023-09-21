export enum UserVerifyStatus {
  Unverified, // chưa xác thực email stauts = 0
  Verified, // đã xác thực email
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment, //ReplyTweet
  QuoteTweet
}

export enum TweetAudience {
  Everyone,
  TweeterCircle
}
