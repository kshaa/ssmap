import { CrudMetadata } from '@shared/crudMetadata'
import { Project } from '@shared/project'
import { UnderlyingDatabase } from '@src/services/database/initDatabase'

export interface ProjectTable {
  upsert: (project: Project) => Promise<Project & CrudMetadata>
  get: (id: string) => Promise<(Project & CrudMetadata) | null>
}

const upsert = async (underlying: UnderlyingDatabase, project: Project) => {
  const result = await underlying.db.get<{ id: string; name: string; created_at: number; updated_at: number }>(`
    INSERT INTO project (id, name, created_at, updated_at) VALUES (?, ?, CAST(unixepoch("subsec") * 1000 AS INTEGER), CAST(unixepoch("subsec") * 1000 AS INTEGER)) 
      ON CONFLICT(id) 
      DO UPDATE SET name = excluded.name, updated_at = CAST(unixepoch("subsec") * 1000 AS INTEGER) 
      RETURNING *
  `, [
    project.id,
    project.name,
  ])
  if (!result) {
    throw new Error('Failed to upsert project')
  }
  return {
    id: result.id,
    name: result.name,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const get = async (underlying: UnderlyingDatabase, id: string): Promise<Project & CrudMetadata | null> => {
  const result = await underlying.db.get(`SELECT * FROM project WHERE id = ?`, [id])
  if (!result) return null
  return {
    id: result.id,
    name: result.name,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

export const createProjectTable = (underlying: UnderlyingDatabase): ProjectTable => {
  // Partially applied, curried functions
  return {
    upsert: upsert.bind(null, underlying),
    get: get.bind(null, underlying),
  }
}
