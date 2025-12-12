import { UnderlyingDatabase } from './initDatabase'
import { createFeedTable, FeedTable } from './tables/feed'
import { createFeedPostTable, FeedPostTable } from './tables/feedPost'
import { createPostTable, PostTable } from './tables/post'
import { createProjectTable, ProjectTable } from './tables/project'
import { createProjectFeedTable, ProjectFeedTable } from './tables/projectFeed'
import { createProjectPostTable, ProjectPostTable } from './tables/projectPost'
import { createProjectPostFeelingTable, ProjectPostFeelingTable } from './tables/projectPostFeeling'

export interface Tables {
  post: PostTable
  feed: FeedTable
  feedPost: FeedPostTable
  project: ProjectTable
  projectPost: ProjectPostTable
  projectFeed: ProjectFeedTable
  projectPostFeeling: ProjectPostFeelingTable
}

export const initTables = async (underlying: UnderlyingDatabase): Promise<Tables> => {
  return {
    post: createPostTable(underlying),
    feed: createFeedTable(underlying),
    feedPost: createFeedPostTable(underlying),
    project: createProjectTable(underlying),
    projectPost: createProjectPostTable(underlying),
    projectFeed: createProjectFeedTable(underlying),
    projectPostFeeling: createProjectPostFeelingTable(underlying),
  }
}
