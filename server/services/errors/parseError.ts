import { BaseError } from './base'

interface ParseInfo {
  entity: string
  isUserError: boolean
}

export class ParseError extends BaseError {
  constructor(info: ParseInfo, cause?: Error) {
    super(`Failed parsing ${info.entity}`, cause, info)
    this.name = 'ParseError'
    this.code = info.isUserError ? 400 : 500
  }
}
