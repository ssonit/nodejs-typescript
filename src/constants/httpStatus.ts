const httpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  PARTIAL_CONTENT: 206,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  UNPROCESSABLE_ENTITY: 422,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

export default httpStatus
