import { BaseError } from './base'
import { ErrorNames } from './errorNames'

export class UnknownError extends BaseError {
  constructor(message: string, cause?: unknown, info?: Record<string, any>) {
    super(message, ErrorNames.UnknownError, 500, cause, info)
    this.name = ErrorNames.UnknownError
    this.code = 500
  }
}
