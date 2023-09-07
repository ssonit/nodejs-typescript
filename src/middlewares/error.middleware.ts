import { Request, Response, NextFunction } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import { omit } from 'lodash'
import httpStatus from '~/constants/httpStatus'
import { messages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/errors'

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, 'status'))
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: messages.TOKEN_IS_INVALID
    })
  }

  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    messages: err.message,
    errorInfo: err
  })
}

export default errorHandler
