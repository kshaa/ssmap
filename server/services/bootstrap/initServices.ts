import { Config } from '@src/services/config/getConfig'
import { DatabaseService, initDatabase } from '../database/initDatabase'
import { buildSsFetcherService, SSFetcherService } from '../ss/ssFetcherService'
import { buildSsSynchronizerService, SSSynchronizerService } from '../ss/ssSynchronizerService'
import { logger } from '../logging/logger'
import { buildSsProjectService, SSProjectService } from '../ss/ssProjectService'

export interface Services {
  database: DatabaseService
  ssFetcher: SSFetcherService
  ssSynchronizer: SSSynchronizerService
  ssProjectService: SSProjectService
}

export const initServices = async (config: Config): Promise<Services> => {
  logger.info('Initializing services')

  logger.info('Initializing database')
  const database = await initDatabase(config.database)

  logger.info('Initializing SS Fetcher')
  const ssFetcher = buildSsFetcherService()

  logger.info('Initializing SS Synchronizer')
  const ssSynchronizer = buildSsSynchronizerService(database, ssFetcher)

  logger.info('Initializing SS Project Service')
  const ssProjectService = buildSsProjectService(database, ssSynchronizer)

  logger.info('Services initialized')
  return {
    database,
    ssFetcher,
    ssSynchronizer,
    ssProjectService,
  }
}
