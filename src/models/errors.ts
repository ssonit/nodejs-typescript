import httpStatus from '~/constants/httpStatus'
import { messages } from '~/constants/messages'

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ message = messages.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: httpStatus.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
