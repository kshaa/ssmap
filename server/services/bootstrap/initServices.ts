import { Config } from '@src/services/config/getConfig'
import { DatabaseService, initDatabase } from '../database/initDatabase'
import { buildSsFetcherService, SSFetcherService } from '../ss/ssFetcherService'

export interface Services {
  database: DatabaseService
  ss: SSFetcherService
}

export const initServices = async (config: Config): Promise<Services> => {
  const database = await initDatabase(config.database)
  const ss = buildSsFetcherService()

  return {
    database,
    ss,
  }
}
