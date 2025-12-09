import { Config } from '@src/services/config/getConfig';
import { DatabaseService, initDatabase } from '../database/initDatabase';

export interface Services {
    database: DatabaseService;
}

export const initServices = async (config: Config): Promise<Services> => {
    const database = await initDatabase(config.database);

    return {
        database
    }
}