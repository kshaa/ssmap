import { CrudMetadata, crudMetadataSchema } from "./crudMetadata"
import { ParsedPostWithUrl, parsedPostWithUrlSchema } from "./post"
import { ParsedFeedWithUrl, parsedFeedWithUrlSchema } from "./feed"
import { ProjectFeed, projectFeedSchema } from "./projectFeed"
import { ProjectPost, projectPostSchema } from "./projectPost"
import { FeedPost, feedPostSchema } from "./feedPost"
import { z } from "zod"

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

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const projectWithContentAndMetadataSchema = z.object({
  project: projectSchema.and(crudMetadataSchema),
  projectPosts: projectPostSchema.and(crudMetadataSchema).array(),
  projectFeeds: projectFeedSchema.and(crudMetadataSchema).array(),
  feeds: parsedFeedWithUrlSchema.and(crudMetadataSchema).array(),
  feedPosts: feedPostSchema.and(crudMetadataSchema).array(),
  posts: parsedPostWithUrlSchema.and(crudMetadataSchema).array(),
})
