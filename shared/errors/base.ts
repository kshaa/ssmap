import { ErrorNames } from "./errorNames"

const serializeError = (name: ErrorNames, message: string, cause: unknown, info?: Record<string, any>, code?: number) => {
  return JSON.stringify({
    message,
    cause,
    info,
    name,
    code
  })
}

export class BaseError extends Error {
  cause?: unknown
  info: Record<string, any>
  name: ErrorNames
  code: number

  constructor(message: string, name: ErrorNames, code: number, cause?: unknown, info?: Record<string, any>) {
    super(message)
    this.name = name
    this.code = code
    this.cause = cause
    this.info = info ?? {}
  }

  serialize(): string {
    const cause = this.cause
      ? this.cause instanceof Error && 'serialize' in this.cause && typeof this.cause.serialize === 'function'
        ? this.cause.serialize()
        : serializeError(ErrorNames.ObfuscatedError, 'Unhandled server error', undefined, { hidden: true }, 500)
      : undefined

    return serializeError(this.name, this.message, cause, this.info, this.code)
  }
}

export const parseAppError = (error: unknown): BaseError | null => {
  if (error instanceof BaseError) return error
  if (
    // Is an object
    error &&
    typeof error === 'object' && 

    // Has a string message
    'message' in error && 
    typeof error.message === 'string' &&

    // Has a name matching known error name
    'name' in error &&
    typeof error.name === 'string' &&
    Object.values(ErrorNames).includes(error.name as ErrorNames) &&

    // Has a number code
    'code' in error &&
    typeof error.code === 'number' &&

    // Has an info object
    'info' in error &&
    error.info &&
    typeof error.info === 'object'
  ) return new BaseError(error.message, error.name as ErrorNames, error.code as number, 'cause' in error ? error.cause : undefined, error.info)
  return null
}