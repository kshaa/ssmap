import { CrudMetadata } from '@shared/crudMetadata'
import { ProjectPostFeeling } from '@shared/projectPostFeeling'
import { UnderlyingDatabase } from '@src/services/database/initDatabase'

export interface ProjectPostFeelingTable {
  upsert: (projectId: string, postUrl: string, feeling: Omit<ProjectPostFeeling, 'projectId' | 'postUrl'>) => Promise<ProjectPostFeeling & CrudMetadata>
  get: (projectId: string, postUrl: string) => Promise<(ProjectPostFeeling & CrudMetadata) | null>
  getAll: (projectId: string) => Promise<(ProjectPostFeeling & CrudMetadata)[]>
  getByPostUrl: (postUrl: string) => Promise<(ProjectPostFeeling & CrudMetadata)[]>
}

const upsert = async (underlying: UnderlyingDatabase, projectId: string, postUrl: string, feeling: Omit<ProjectPostFeeling, 'projectId' | 'postUrl'>) => {
  const result =  await underlying.db.get(`
    INSERT INTO project_post_feeling (
      project_id, 
      post_url, 
      is_seen, 
      stars, 
      created_at, 
      updated_at
    ) VALUES (?, ?, ?, ?, CAST(unixepoch("subsec") * 1000 AS INTEGER), CAST(unixepoch("subsec") * 1000 AS INTEGER)) 
      ON CONFLICT (project_id, post_url) 
      DO UPDATE SET 
        is_seen = excluded.is_seen, 
        stars = excluded.stars, 
        updated_at = CAST(unixepoch("subsec") * 1000 AS INTEGER) 
      RETURNING *
  `, [
    projectId,
    postUrl,
    feeling.isSeen,
    feeling.stars,
  ])
  if (!result) {
    throw new Error('Failed to upsert project post')
  }
  return {
    projectId: String(result.project_id),
    postUrl: String(result.post_url),
    isSeen: Boolean(result.is_seen),
    stars: result.stars,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const get = async (underlying: UnderlyingDatabase, projectId: string, postUrl: string) => {
  const result = await underlying.db.get<{ project_id: string; post_url: string; is_seen: boolean; stars: number; created_at: number; updated_at: number }>(`SELECT * FROM project_post WHERE project_id = ? AND post_url = ?`, [projectId, postUrl])
  if (!result) return null
  return {
    projectId: String(result.project_id),
    postUrl: String(result.post_url),
    isSeen: Boolean(result.is_seen),
    stars: result.stars,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const getAll = async (underlying: UnderlyingDatabase, projectId: string) => {
  const result = await underlying.db.all<{ project_id: string; post_url: string; is_seen: boolean; stars: number; created_at: number; updated_at: number }[]>(`SELECT * FROM project_post_feeling WHERE project_id = ?`, [projectId])
  return result.map(result => ({
    projectId: String(result.project_id),
    postUrl: String(result.post_url),
    isSeen: Boolean(result.is_seen),
    stars: result.stars,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }))
}

const getByPostUrl = async (underlying: UnderlyingDatabase, postUrl: string) => {
  const result = await underlying.db.all<{ project_id: string; post_url: string; is_seen: boolean; stars: number; created_at: number; updated_at: number }[]>(`SELECT * FROM project_post_feeling WHERE post_url = ?`, [postUrl])
  return result.map(result => ({
    projectId: String(result.project_id),
    postUrl: String(result.post_url),
    isSeen: Boolean(result.is_seen),
    stars: result.stars,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }))
}

export const createProjectPostFeelingTable = (underlying: UnderlyingDatabase): ProjectPostFeelingTable => {
  // Partially applied, curried functions
  return {
    upsert: upsert.bind(null, underlying),
    get: get.bind(null, underlying),
    getAll: getAll.bind(null, underlying),
    getByPostUrl: getByPostUrl.bind(null, underlying),
  }
}
