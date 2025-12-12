import { CrudMetadata } from '@shared/crudMetadata'
import { Project } from '@shared/project'
import { UnderlyingDatabase } from '@src/services/database/initDatabase'

export interface ProjectTable {
  create: (project: Project) => Promise<Project & CrudMetadata>
  get: (id: string) => Promise<(Project & CrudMetadata) | null>
}

const create = async (underlying: UnderlyingDatabase, project: Project) => {
  const result = await underlying.db.get<{ id: string; created_at: number; updated_at: number }>(`
    INSERT INTO project (id, created_at, updated_at) VALUES (?, CAST(unixepoch("subsec") * 1000 AS INTEGER), CAST(unixepoch("subsec") * 1000 AS INTEGER)) 
      ON CONFLICT(id) 
      DO UPDATE SET updated_at = CAST(unixepoch("subsec") * 1000 AS INTEGER) 
      RETURNING *
  `, [
    project.id,
  ])
  if (!result) {
    throw new Error('Failed to create project')
  }
  return {
    id: result.id,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

const get = async (underlying: UnderlyingDatabase, id: string) => {
  const result = await underlying.db.get(`SELECT * FROM project WHERE id = ?`, [id])
  if (!result) return null
  return {
    id: result.id,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }
}

export const createProjectTable = (underlying: UnderlyingDatabase): ProjectTable => {
  // Partially applied, curried functions
  return {
    create: create.bind(null, underlying),
    get: get.bind(null, underlying),
  }
}
