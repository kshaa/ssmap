import { CrudMetadata } from "./crudMetadata"
import { ParsedFeedWithUrl } from "./feed"
import { ParsedPostWithUrl } from "./post"

export enum Staleness {
  Cached = 'cached',
  FreshlyFetched = 'freshlyFetched',
  Refreshed = 'refreshed',
}

export interface WithStaleness {
  staleness: Staleness
}

export type PostSync = ParsedPostWithUrl & CrudMetadata & WithStaleness
export type FeedSync = ParsedFeedWithUrl & CrudMetadata & WithStaleness
export type FeedAndPostsSync = { feed: ParsedFeedWithUrl & CrudMetadata, posts: (ParsedPostWithUrl & CrudMetadata)[] }

export enum ThingKind {
  Post = 'post',
  Feed = 'feed',
  FeedAndPosts = 'feedAndPosts',
}
export type PostThingSync = { kind: ThingKind.Post, data: PostSync }
export type FeedThingSync = { kind: ThingKind.Feed, data: FeedSync }
export type FeedAndPostThingSync = { kind: ThingKind.FeedAndPosts, data: FeedAndPostsSync }
export type ThingSync = PostThingSync | FeedThingSync | FeedAndPostThingSync
