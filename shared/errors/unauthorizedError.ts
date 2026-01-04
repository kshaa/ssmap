import { BaseError } from './base'
import { ErrorNames } from './errorNames'

interface UnauthorizedInfo {
  action: string
  hint?: string
}

export class UnauthorizedError extends BaseError {
  constructor(info: UnauthorizedInfo, cause?: unknown) {
    super(
      `Not authorized to perform action${info.action} ${info.hint ? ` (${info.hint})` : ''}`,
      ErrorNames.UnauthorizedError,
      401,
      cause,
      info
    )
  }
}
