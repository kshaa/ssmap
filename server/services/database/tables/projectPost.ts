import { CrudMetadata } from '@shared/crudMetadata'
import { ProjectPost } from '@shared/projectPost'
import { UnderlyingDatabase } from '@src/services/database/initDatabase'

export interface ProjectPostTable {
  upsert: (projectId: string, postUrl: string) => Promise<ProjectPost & CrudMetadata>
  get: (projectId: string, postUrl: string) => Promise<(ProjectPost & CrudMetadata) | null>
}

const upsert = async (underlying: UnderlyingDatabase, projectId: string, postUrl: string) => {
  const result =  await underlying.db.get(`
    INSERT INTO project_post (
      project_id, 
      post_url, 
      created_at, 
      updated_at
    ) VALUES (?, ?, CAST(unixepoch("subsec") * 1000 AS INTEGER), CAST(unixepoch("subsec") * 1000 AS INTEGER)) 
      ON CONFLICT (project_id, post_url) 
      DO UPDATE SET 
        updated_at = CAST(unixepoch("subsec") * 1000 AS INTEGER) 
      RETURNING *
  `, [
    projectId,
    postUrl,
  ])
  if (!result) {
    throw new Error('Failed to upsert project post')
  }
  return {
    projectId: result.project_id,
    postUrl: result.post_url,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const get = async (underlying: UnderlyingDatabase, projectId: string, postUrl: string) => {
  const result = await underlying.db.get<{ project_id: string; post_url: string; created_at: number; updated_at: number }>(`SELECT * FROM project_post WHERE project_id = ? AND post_url = ?`, [projectId, postUrl])
  if (!result) return null
  return {
    projectId: result.project_id,
    postUrl: result.post_url,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

export const createProjectPostTable = (underlying: UnderlyingDatabase): ProjectPostTable => {
  // Partially applied, curried functions
  return {
    upsert: upsert.bind(null, underlying),
    get: get.bind(null, underlying),
  }
}
