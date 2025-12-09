import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../logging/logger';

export interface DatabaseConfig {
    dbPath: string;
    migrationsPath: string;
}

export interface ApiConfig {
    port: number;
}

export interface Config {
    api: ApiConfig;
    database: DatabaseConfig;
}

export const getConfig = (): Config => {
    logger.info('Loading config w/ dotenv support');
    dotenv.config({ quiet: true });    

    let apiPort;
    if (process.env.PORT) {
        apiPort = parseInt(process.env.PORT);
        if (isNaN(apiPort)) throw new Error('PORT is not a number');
    } else {
        apiPort = 3001;
        logger.warn(`PORT is not set, using default port: ${apiPort}`);
    };

    let dbPath;
    if (process.env.DATABASE_PATH) {
        dbPath = process.env.DATABASE_PATH;
    } else {
        dbPath = path.join(process.cwd(), 'database.db');
        logger.warn(`DATABASE_PATH is not set, using default database path: ${dbPath}`);
    }

    let migrationsPath
    if (process.env.MIGRATIONS_PATH) {
        migrationsPath = process.env.MIGRATIONS_PATH;
    } else {
        migrationsPath = path.join(process.cwd(), 'services', 'database', 'migrations');
        logger.warn(`MIGRATIONS_PATH is not set, using default migrations path: ${migrationsPath}`);
    }

    const config = {
        api: {
            port: apiPort
        },
        database: {
            dbPath,
            migrationsPath,
        }
    }

    logger.info(config, 'Config loaded');
    return config;
}
