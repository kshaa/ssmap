import { CrudMetadata } from '@shared/crudMetadata'
import { ProjectFeed } from '@shared/projectFeed'
import { UnderlyingDatabase } from '@src/services/database/initDatabase'

export interface ProjectFeedTable {
  upsert: (projectId: string, feedUrl: string) => Promise<ProjectFeed & CrudMetadata>
  get: (projectId: string, feedUrl: string) => Promise<(ProjectFeed & CrudMetadata) | null>
  getAll: (projectId: string) => Promise<(ProjectFeed & CrudMetadata)[]>
}

const upsert = async (underlying: UnderlyingDatabase, projectId: string, feedUrl: string) => {
  const result =  await underlying.db.get(`
    INSERT INTO project_feed (
      project_id, 
      feed_url, 
      created_at, 
      updated_at
    ) VALUES (?, ?, CAST(unixepoch("subsec") * 1000 AS INTEGER), CAST(unixepoch("subsec") * 1000 AS INTEGER)) 
      ON CONFLICT (project_id, feed_url) 
      DO UPDATE SET 
        updated_at = CAST(unixepoch("subsec") * 1000 AS INTEGER) 
      RETURNING *
  `, [
    projectId,
    feedUrl,
  ])
  if (!result) {
    throw new Error('Failed to upsert project feed')
  }
  return {
    projectId: String(result.project_id),
    feedUrl: String(result.feed_url),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const get = async (underlying: UnderlyingDatabase, projectId: string, feedUrl: string) => {
  const result = await underlying.db.get<{ project_id: string; feed_url: string; created_at: number; updated_at: number }>(`SELECT * FROM project_feed WHERE project_id = ? AND feed_url = ?`, [projectId, feedUrl])
  if (!result) return null
  return {
    projectId: String(result.project_id),
    feedUrl: String(result.feed_url),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const getAll = async (underlying: UnderlyingDatabase, projectId: string): Promise<(ProjectFeed & CrudMetadata)[]> => {
  const result = await underlying.db.all<{ project_id: string; feed_url: string; created_at: number; updated_at: number }[]>(`SELECT * FROM project_feed WHERE project_id = ?`, [projectId])
  return result.map(result => ({
    projectId: String(result.project_id),
    feedUrl: String(result.feed_url),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }))
}

export const createProjectFeedTable = (underlying: UnderlyingDatabase): ProjectFeedTable => {
  // Partially applied, curried functions
  return {
    upsert: upsert.bind(null, underlying),
    get: get.bind(null, underlying),
    getAll: getAll.bind(null, underlying),
  }
}
