import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: "yyyy-mm-dd'T'HH:MM:ss.l'Z'",
      ignore: 'pid,hostname',
    },
  },
})
