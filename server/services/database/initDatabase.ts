import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import { DatabaseConfig } from '../config/getConfig';
import { initTables, Tables } from './initTables';

export interface UnderlyingDatabase {
    db: Database;
}

export interface DatabaseService {
    underlying: UnderlyingDatabase;
    tables: Tables;
}

const migrateDatabase = async (config: DatabaseConfig, underlying: UnderlyingDatabase) => {
    await underlying.db.migrate({ migrationsPath: config.migrationsPath })    
}

const initUnderlying = async (config: DatabaseConfig): Promise<UnderlyingDatabase> => {
    sqlite3.verbose();

    const db = await open({
        filename: config.dbPath,
        driver: sqlite3.cached.Database
    })  
    
    const underlying = { db }

    await migrateDatabase(config, underlying);

    return underlying;
}

export const initDatabase = async (config: DatabaseConfig): Promise<DatabaseService> => {
    const underlying = await initUnderlying(config);
    const tables = await initTables(underlying);

    return {
        underlying,
        tables
    }
}
