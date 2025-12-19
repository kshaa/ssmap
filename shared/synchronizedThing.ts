import z from "zod"
import { CrudMetadata } from "./crudMetadata"
import { ParsedFeedWithUrl, parsedFeedWithUrlSchema } from "./feed"
import { FeedPost, feedPostSchema } from "./feedPost"
import { ParsedPostWithUrl, parsedPostWithUrlSchema } from "./post"

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

export const postThingSyncSchema = z.object({
  kind: z.literal(ThingKind.Post),
  data: parsedPostWithUrlSchema,
})

export const feedThingSyncSchema = z.object({
  kind: z.literal(ThingKind.Feed).or(z.literal(ThingKind.ListingPage)),
  data: parsedFeedWithUrlSchema,
})

export const feedAndPostThingSyncSchema = z.object({
  kind: z.literal(ThingKind.FeedAndPosts).or(z.literal(ThingKind.ListingPageAndPosts)),
  data: z.object({
    feed: parsedFeedWithUrlSchema,
    posts: parsedPostWithUrlSchema.array(),
    feedPosts: feedPostSchema.array(),
  }),
})

export const thingSyncSchema = z.discriminatedUnion('kind', [postThingSyncSchema, feedThingSyncSchema, feedAndPostThingSyncSchema])
