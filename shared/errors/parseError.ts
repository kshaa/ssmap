import { BaseError } from './base'
import { ErrorNames } from './errorNames'

interface ParseInfo {
  entity: string
  isUserError: boolean
}

export class ParseError extends BaseError {
  constructor(info: ParseInfo, cause?: unknown) {
    super(`Failed parsing ${info.entity}`, ErrorNames.ParseError, info.isUserError ? 400 : 500, cause, info)
  }
}
