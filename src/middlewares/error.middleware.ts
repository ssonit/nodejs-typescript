import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import httpStatus from '~/constants/httpStatus'
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json(omit(err, 'status'))
}

export default errorHandler
