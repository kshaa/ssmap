import { CrudMetadata } from "./crudMetadata"
import { ParsedPostWithUrl } from "./post"
import { ParsedFeedWithUrl } from "./feed"
import { ProjectFeed } from "./projectFeed"
import { ProjectPost } from "./projectPost"
import { FeedPost } from "./feedPost"

export interface Project {
  id: string
  name: string
}

export interface ProjectWithContentAndMetadata {
  project: (Project & CrudMetadata)
  projectPosts: (ProjectPost & CrudMetadata)[]
  projectFeeds: (ProjectFeed & CrudMetadata)[]
  feeds: (ParsedFeedWithUrl & CrudMetadata)[]
  feedPosts: (FeedPost & CrudMetadata)[]
  posts: (ParsedPostWithUrl & CrudMetadata)[]
}
