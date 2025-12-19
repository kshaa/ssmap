import { CrudMetadata } from '@shared/crudMetadata'
import { ParsedFeed, ParsedFeedWithUrl } from '@shared/feed'
import { UnderlyingDatabase } from '@src/services/database/initDatabase'

export interface FeedTable {
  upsert: (url: string, feed: ParsedFeed, isListingPage: boolean) => Promise<ParsedFeedWithUrl & CrudMetadata>
  get: (url: string) => Promise<ParsedFeedWithUrl & CrudMetadata | null>
}

const upsert = async (underlying: UnderlyingDatabase, url: string, feed: ParsedFeed, isListingPage: boolean): Promise<ParsedFeedWithUrl & CrudMetadata> => {
  const result = await underlying.db.get<{ url: string; data: string; is_listing_page: boolean; ttl_seconds: number; created_at: number; updated_at: number }>(`
    INSERT INTO feed (
      url, 
      data, 
      is_listing_page,
      created_at, 
      updated_at
    ) VALUES (?, ?, ?, CAST(unixepoch("subsec") * 1000 AS INTEGER), CAST(unixepoch("subsec") * 1000 AS INTEGER)) 
      ON CONFLICT(url) 
      DO UPDATE SET data = excluded.data, is_listing_page = excluded.is_listing_page, updated_at = CAST(unixepoch("subsec") * 1000 AS INTEGER) 
      RETURNING *
  `, [
    url,
    JSON.stringify(feed),
    isListingPage,
  ])
  if (!result) {
    throw new Error('Failed to upsert feed')
  }
  return {
    url: String(result.url),
    data: JSON.parse(result.data),
    isListingPage: Boolean(result.is_listing_page),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const get = async (underlying: UnderlyingDatabase, url: string): Promise<ParsedFeedWithUrl & CrudMetadata | null> => {
  const result = await underlying.db.get<{ url: string; data: string; is_listing_page: boolean; created_at: number; updated_at: number }>(`SELECT * FROM feed WHERE url = ?`, [url])
  if (!result) return null
  return {
    url: String(result.url),
    data: JSON.parse(result.data),
    isListingPage: Boolean(result.is_listing_page),
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
