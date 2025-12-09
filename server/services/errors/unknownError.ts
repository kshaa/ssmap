import { BaseError } from './base'

export class UnknownError extends BaseError {
  constructor(message: string, cause?: Error, info?: Record<string, any>) {
    super(message, cause, info)
    this.name = 'UnknownError'
    this.code = 500
  }
}
