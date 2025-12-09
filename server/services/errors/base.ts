export class BaseError extends Error {
  cause?: Error
  info?: Record<string, any>
  name: string
  code: number

  constructor(message: string, cause?: Error, info?: Record<string, any>) {
    super(message)
    this.cause = cause
    this.info = info
  }

  serialize(): string {
    const cause = this.cause
      ? 'serialize' in this.cause && typeof this.cause.serialize === 'function'
        ? this.cause.serialize()
        : { name: 'ObfuscatedError', message: 'Unhandled server error', info: { hidden: true } }
      : undefined

    const info = this.info ?? {}

    return JSON.stringify({
      message: this.message,
      cause,
      info,
      name: this.name,
    })
  }
}
