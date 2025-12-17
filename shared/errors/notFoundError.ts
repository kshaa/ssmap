import { BaseError } from './base'
import { ErrorNames } from './errorNames'

interface NotFoundInfo {
  entity: string
  id: string
  secondaryEntity?: string
  secondaryId?: string
  hint?: string
}

export class NotFoundError extends BaseError {
  constructor(info: NotFoundInfo) {
    super(
      `${info.entity} ${info.id} ${info.secondaryEntity ? `${info.secondaryEntity} ${info.secondaryId}` : ''} not found`,
      ErrorNames.NotFoundError,
      404,
      undefined,
      info
    )
  }
}
