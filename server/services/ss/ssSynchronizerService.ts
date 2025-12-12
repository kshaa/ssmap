import { ParsedPostWithUrl } from "@shared/post"
import { ParsedFeedWithUrl } from "@shared/feed"
import { getUniqueUrl, SSFetcherService } from "./ssFetcherService"
import { DatabaseService } from "../database/initDatabase"
import PQueue from "p-queue"
import { DEFAULT_TTL_SECONDS } from "./common"
import { CrudMetadata } from "@shared/crudMetadata"

export enum Staleness {
  Cached = 'cached',
  FreshlyFetched = 'freshlyFetched',
  Refreshed = 'refreshed',
}

interface WithStaleness {
  staleness: Staleness
}

export interface SSSynchronizerService {
  syncPost: (postUrl: string) => Promise<ParsedPostWithUrl & CrudMetadata & WithStaleness>
  syncFeed: (feedUrl: string) => Promise<ParsedFeedWithUrl & CrudMetadata & WithStaleness>
  syncFeedAndPosts: (feedUrl: string) => Promise<{ feed: ParsedFeedWithUrl & CrudMetadata, posts: (ParsedPostWithUrl & CrudMetadata)[] }>
}

interface State {
  database: DatabaseService
  fetcher: SSFetcherService
  queue: PQueue
}

const initState = (database: DatabaseService, fetcher: SSFetcherService): State => {
  // Completely arbitrary concurrency control, just a guesstimate to not abuse ss.lv
  // To be fair, we could do a lot more limiting, but I doubt anyone besides me would use this code :sweat_smile:
  // If you're reading this and you're not me, please feel free to improve the concurrency control.
  // E.g. we could limit the number of requests per minute, or per IP address, or per user agent, etc.
  const queue = new PQueue({ concurrency: 3 })

  return {
    database,
    fetcher,
    queue,
  }
}

const isStale = (timestampMs: number, ttlSeconds: number): boolean => {
  const ttlMs = ttlSeconds * 1000
  const nowMs = Date.now()
  const diffMs = nowMs - timestampMs
  return diffMs > ttlMs
}

const syncPost = async (state: State, rawPostUrl: string): Promise<ParsedPostWithUrl & CrudMetadata & WithStaleness> => {
  return await state.queue.add(async () => {
    // Normalize the URL
    const postUrl = getUniqueUrl(rawPostUrl)
    // Fetch, maybe we have that post in the database already
    const existingPost = await state.database.tables.post.get(postUrl)
    // If we do and it's not stale, return it
    if (existingPost && !isStale(existingPost.updatedAt, DEFAULT_TTL_SECONDS)) return { ...existingPost, staleness: Staleness.Cached }
    // If it does not exist or is stale, fetch it
    const post = await state.fetcher.fetchParsedPost(postUrl)
    // Upsert the post into the database
    const persistedPost = await state.database.tables.post.upsert(postUrl, post.data)
    // Return the persisted post with timestamps
    return { ...persistedPost, staleness: existingPost ? Staleness.Refreshed : Staleness.FreshlyFetched }
  })
}

const syncFeed = async (state: State, rawFeedUrl: string): Promise<ParsedFeedWithUrl & CrudMetadata & WithStaleness> => {
  return await state.queue.add(async () => {
    // Normalize the URL
    const feedUrl = getUniqueUrl(rawFeedUrl)
    // Fetch, maybe we have that feed in the database already
    const existingFeed = await state.database.tables.feed.get(feedUrl)
    // If we do and it's not stale, return it
    if (existingFeed && !isStale(existingFeed.updatedAt, existingFeed.data.ttlSeconds)) return { ...existingFeed, staleness: Staleness.Cached }
    // If it does not exist or is stale, fetch it
    const feed = await state.fetcher.fetchParsedFeed(feedUrl)
    // Upsert the feed into the database
    const persistedFeed = await state.database.tables.feed.upsert(feedUrl, feed.data)
    // Return the persisted feed with timestamps
    return { ...persistedFeed, staleness: existingFeed ? Staleness.Refreshed : Staleness.FreshlyFetched }
  })
}

const syncFeedAndPosts = async (state: State, rawFeedUrl: string): Promise<{ feed: ParsedFeedWithUrl & CrudMetadata, posts: (ParsedPostWithUrl & CrudMetadata)[] }> => {
  return await state.queue.add(async () => {
    const feed = await syncFeed(state, rawFeedUrl)
    const posts = await Promise.all(feed.data.posts.map(post => syncPost(state, post.url)))
    return { feed, posts }
  })
}

export const buildSsSynchronizerService = (database: DatabaseService, fetcher: SSFetcherService): SSSynchronizerService => {
  const state = initState(database, fetcher)
  return {
    syncPost: syncPost.bind(null, state),
    syncFeed: syncFeed.bind(null, state),
    syncFeedAndPosts: syncFeedAndPosts.bind(null, state),
  }
}
