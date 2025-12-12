import { Config } from '@src/services/config/getConfig'
import { DatabaseService, initDatabase } from '../database/initDatabase'
import { buildSsFetcherService, SSFetcherService } from '../ss/ssFetcherService'
import { buildSsSynchronizerService, SSSynchronizerService } from '../ss/ssSynchronizerService'

export interface Services {
  database: DatabaseService
  ssFetcher: SSFetcherService
  ssSynchronizer: SSSynchronizerService
}

export const initServices = async (config: Config): Promise<Services> => {
  const database = await initDatabase(config.database)
  const ssFetcher = buildSsFetcherService()
  const ssSynchronizer = buildSsSynchronizerService(database, ssFetcher)

  return {
    database,
    ssFetcher,
    ssSynchronizer,
  }
}
