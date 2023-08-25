import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import httpStatus from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/errors'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)

    if (errors.isEmpty()) {
      return next()
    }

    const errorsObject = errors.mapped()

    const entityError = new EntityError({ errors: {} })

    for (const key in errorsObject) {
      const { msg } = errorsObject[key]

      // Trả về lỗi không phải do validate
      if (msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }

      entityError.errors[key] = errorsObject[key]
    }

    next(entityError)
  }
}
