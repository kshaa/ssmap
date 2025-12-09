import { Config } from '@src/services/config/getConfig'
import { DatabaseService, initDatabase } from '../database/initDatabase'
import { buildSSService, SSService } from '../ss/buildSSService'

export interface Services {
  database: DatabaseService
  ss: SSService
}

export const initServices = async (config: Config): Promise<Services> => {
  const database = await initDatabase(config.database)
  const ss = buildSSService()

  return {
    database,
    ss,
  }
}
