import { CrudMetadata } from '@shared/crudMetadata'
import { FeedPost } from '@shared/feedPost'
import { UnderlyingDatabase } from '@src/services/database/initDatabase'

export interface FeedPostTable {
  upsert: (feedUrl: string, postUrl: string) => Promise<FeedPost & CrudMetadata>
  get: (feedUrl: string, postUrl: string) => Promise<FeedPost & CrudMetadata | null>
  getAll: (feedUrl: string) => Promise<(FeedPost & CrudMetadata)[]>
}

const upsert = async (underlying: UnderlyingDatabase, feedUrl: string, postUrl: string) => {
  const result = await underlying.db.get<{ feed_url: string; post_url: string; created_at: number; updated_at: number }>(`
    INSERT INTO feed_post (
      feed_url, 
      post_url, 
      created_at, 
      updated_at
    ) VALUES (?, ?, CAST(unixepoch("subsec") * 1000 AS INTEGER), CAST(unixepoch("subsec") * 1000 AS INTEGER)) 
      ON CONFLICT(feed_url, post_url) 
      DO UPDATE SET updated_at = CAST(unixepoch("subsec") * 1000 AS INTEGER) 
      RETURNING *
  `, [
    feedUrl,
    postUrl,
  ])
  if (!result) {
    throw new Error('Failed to upsert feed post')
  }
  return {
    feedUrl: result.feed_url,
    postUrl: result.post_url,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const get = async (underlying: UnderlyingDatabase, feedUrl: string, postUrl: string) => {
  const result = await underlying.db.get<{ feed_url: string; post_url: string; created_at: number; updated_at: number }>(`SELECT * FROM feed_post WHERE feed_url = ? AND post_url = ?`, [feedUrl, postUrl])
  if (!result) return null
  return {
    feedUrl: result.feed_url,
    postUrl: result.post_url,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const getAll = async (underlying: UnderlyingDatabase, feedUrl: string): Promise<(FeedPost & CrudMetadata)[]> => {
  const result = await underlying.db.all<{ feed_url: string; post_url: string; created_at: number; updated_at: number }[]>(`SELECT * FROM feed_post WHERE feed_url = ?`, [feedUrl])
  return result.map(result => ({
    feedUrl: result.feed_url,
    postUrl: result.post_url,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }))
}

export const createFeedPostTable = (underlying: UnderlyingDatabase): FeedPostTable => {
  // Partially applied, curried functions
  return {
    upsert: upsert.bind(null, underlying),
    get: get.bind(null, underlying),
    getAll: getAll.bind(null, underlying),
  }
}
