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
