import { CrudMetadata } from '@shared/crudMetadata'
import { ParsedPost, ParsedPostWithUrl } from '@shared/post'
import { UnderlyingDatabase } from '@src/services/database/initDatabase'

export interface PostTable {
  upsert: (url: string, post: ParsedPost) => Promise<ParsedPostWithUrl & CrudMetadata>
  get: (url: string) => Promise<ParsedPostWithUrl & CrudMetadata | null>
  getAll: () => Promise<(ParsedPostWithUrl & CrudMetadata)[]>
}

const upsert = async (underlying: UnderlyingDatabase, url: string, post: ParsedPost) => {
  const result = await underlying.db.get<{ url: string; data: string; created_at: number; updated_at: number }>(`
    INSERT INTO post (url, data, created_at, updated_at) VALUES (?, ?, CAST(unixepoch("subsec") * 1000 AS INTEGER), CAST(unixepoch("subsec") * 1000 AS INTEGER)) 
      ON CONFLICT (url) 
      DO UPDATE SET data = excluded.data, updated_at = CAST(unixepoch("subsec") * 1000 AS INTEGER) 
      RETURNING *
  `, [
    url,
    JSON.stringify(post),
  ])
  if (!result) {
    throw new Error('Failed to upsert post')
  }
  return {
    url: String(result.url),
    data: JSON.parse(result.data),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const get = async (underlying: UnderlyingDatabase, url: string) => {
  const result = await underlying.db.get<{ url: string; data: string; created_at: number; updated_at: number }>(`SELECT * FROM post WHERE url = ?`, [url])
  if (!result) return null
  return {
    url: String(result.url),
    data: JSON.parse(result.data),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const getAll = async (underlying: UnderlyingDatabase): Promise<(ParsedPostWithUrl & CrudMetadata)[]> => {
  const result = await underlying.db.all<{ url: string; data: string; created_at: number; updated_at: number }[]>(`SELECT * FROM post`)
  return result.map(result => ({
    url: String(result.url),
    data: JSON.parse(result.data),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }))
}

export const createPostTable = (underlying: UnderlyingDatabase): PostTable => {
  // Partially applied, curried functions
  return {
    upsert: upsert.bind(null, underlying),
    get: get.bind(null, underlying),
    getAll: getAll.bind(null, underlying),
  }
}
