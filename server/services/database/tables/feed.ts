import { CrudMetadata } from '@shared/crudMetadata'
import { ParsedFeed, ParsedFeedWithUrl } from '@shared/feed'
import { UnderlyingDatabase } from '@src/services/database/initDatabase'

export interface FeedTable {
  upsert: (url: string, feed: ParsedFeed) => Promise<ParsedFeedWithUrl & CrudMetadata>
  get: (url: string) => Promise<ParsedFeedWithUrl & CrudMetadata | null>
}

const upsert = async (underlying: UnderlyingDatabase, url: string, feed: ParsedFeed) => {
  const result = await underlying.db.get<{ url: string; data: string; ttl_seconds: number; created_at: number; updated_at: number }>(`
    INSERT INTO feed (
      url, 
      data, 
      created_at, 
      updated_at
    ) VALUES (?, ?, CAST(unixepoch("subsec") * 1000 AS INTEGER), CAST(unixepoch("subsec") * 1000 AS INTEGER)) 
      ON CONFLICT(url) 
      DO UPDATE SET data = excluded.data, updated_at = CAST(unixepoch("subsec") * 1000 AS INTEGER) 
      RETURNING *
  `, [
    url,
    JSON.stringify(feed),
  ])
  if (!result) {
    throw new Error('Failed to upsert feed')
  }
  return {
    url: result.url,
    data: JSON.parse(result.data),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const get = async (underlying: UnderlyingDatabase, url: string) => {
  const result = await underlying.db.get<{ url: string; data: string; created_at: number; updated_at: number }>(`SELECT * FROM feed WHERE url = ?`, [url])
  if (!result) return null
  return {
    url: result.url,
    data: JSON.parse(result.data),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

export const createFeedTable = (underlying: UnderlyingDatabase): FeedTable => {
  // Partially applied, curried functions
  return {
    upsert: upsert.bind(null, underlying),
    get: get.bind(null, underlying),
  }
}
