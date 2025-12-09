import { UnderlyingDatabase } from './initDatabase'
import { createPostTable, PostTable } from './tables/post'
import { createProjectTable, ProjectTable } from './tables/project'

export interface Tables {
  project: ProjectTable
  post: PostTable
}

export const initTables = async (underlying: UnderlyingDatabase): Promise<Tables> => {
  return {
    post: createPostTable(underlying),
    project: createProjectTable(underlying),
  }
}
