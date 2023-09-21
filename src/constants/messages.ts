export const messages = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_ALREADY_EXIST: 'Email already exists',
  USER_NOT_FOUND: 'User not found',
  EMAIL_OR_PASSWORD_INCORRECT: 'Email or password incorrect',
  ACCESS_TOKEN_REQUIRED: 'Access token required',
  REFRESH_TOKEN_REQUIRED: 'Refresh token required',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  LOGOUT_SUCCESS: 'Logout success',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFIED: 'Email verified',
  EMAIL_VERIFY_SUCCESS: 'Email verify success',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email success',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_VERIFY_TOKEN_INVALID: 'Forgot verify token invalid',
  TOKEN_IS_INVALID: 'Token is invalid',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  USER_NOT_VERIFIED: 'User not verified',
  USERNAME_INVALID:
    'Username must be 4-15 characters long and contain only letters and numbers and underscores, not only numbers and underscores',
  USERNAME_EXISTS: 'Username already exists'
} as const

export const TWEET_MESSAGES = {
  INVALID_TYPE: 'Invalid type',
  PARENT_ID_MUST_BE_VALID_TWEET_ID: 'Parent id must be valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non-empty string',
  CONTENT_MUST_BE_EMPTY_STRING: 'Content must be empty string'
} as const
