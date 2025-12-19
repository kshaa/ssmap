import { CrudMetadata } from "./crudMetadata"
import { ParsedFeedWithUrl } from "./feed"
import { FeedPost } from "./feedPost"
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
export type FeedAndPostsSync = { feed: ParsedFeedWithUrl & CrudMetadata, posts: (ParsedPostWithUrl & CrudMetadata)[], feedPosts: (FeedPost & CrudMetadata)[] }

export enum ThingKind {
  Post = 'post',
  Feed = 'feed',
  FeedAndPosts = 'feedAndPosts',
  ListingPage = 'listingPage',
  ListingPageAndPosts = 'listingPageAndPosts',
}
export type PostThingSync = { kind: ThingKind.Post, data: PostSync }
export type FeedThingSync = { kind: ThingKind.Feed | ThingKind.ListingPage, data: FeedSync }
export type FeedAndPostThingSync = { kind: ThingKind.FeedAndPosts | ThingKind.ListingPageAndPosts, data: FeedAndPostsSync }
export type ThingSync = PostThingSync | FeedThingSync | FeedAndPostThingSync
