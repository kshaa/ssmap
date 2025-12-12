import { ParsedPostWithUrl } from "@shared/post"
import { ParsedFeedWithUrl } from "@shared/feed"
import { getUniqueUrl, SSFetcherService } from "./ssFetcherService"
import { DatabaseService } from "../database/initDatabase"
import PQueue from "p-queue"
import { DEFAULT_TTL_SECONDS } from "./common"
import { CrudMetadata } from "@shared/crudMetadata"
import { PostSync, FeedSync, FeedAndPostsSync, ThingSync, WithStaleness, ThingKind, Staleness } from "@shared/synchronizedThing"
export interface SSSynchronizerService {
  syncPost: (postUrl: string) => Promise<PostSync>
  syncFeed: (feedUrl: string) => Promise<FeedSync>
  syncFeedAndPosts: (feedUrl: string) => Promise<FeedAndPostsSync>
  syncSsUrl: (url: string, isDeepSearch: boolean) => Promise<ThingSync>
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
    const postUrl = getUniqueUrl(rawPostUrl).urlText
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
    const feedUrl = getUniqueUrl(rawFeedUrl).urlText
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

const urlInspect = (rawUrl: string, isDeepSearch: boolean): { kind: ThingKind, url: string } => {
  // Parse whether a URL is syntactically valid and from SS.lv
  const { urlText, url } = getUniqueUrl(rawUrl)

  if (url.pathname.includes('/rss/')) {
    // Seems like an RSS feed, let's either sync the feed itself or it and its posts
    return { kind: isDeepSearch ? ThingKind.FeedAndPosts : ThingKind.Feed, url: urlText }
  } else if (url.pathname.endsWith('.html')) {
    // Seems like a post, let's sync it
    return { kind: ThingKind.Post, url: urlText }
  } else {
    // Seems like something else, let's assume it's a listing page
    // If this assumption is wrong, we'll just fail later and it's fine
    // But if it's a listing page, we can append /rss/ to it and try parsing it as a feed
    // Remove trailing slash if present to avoid double slashes
    const baseUrl = urlText.endsWith('/') ? urlText.slice(0, -1) : urlText
    return { kind: isDeepSearch ? ThingKind.FeedAndPosts : ThingKind.Feed, url: baseUrl + '/rss/' }
  }
}

const syncSsUrl = async (state: State, url: string, isDeepSearch: boolean): Promise<ThingSync> => {
  const { kind, url: urlText } = urlInspect(url, isDeepSearch)
  switch (kind) {
    case ThingKind.Post:
      return { kind: ThingKind.Post, data: await syncPost(state, urlText) }
    case ThingKind.Feed:
      return { kind: ThingKind.Feed, data: await syncFeed(state, urlText) }
    case ThingKind.FeedAndPosts:
      return { kind: ThingKind.FeedAndPosts, data: await syncFeedAndPosts(state, urlText) }
  }
}

export const buildSsSynchronizerService = (database: DatabaseService, fetcher: SSFetcherService): SSSynchronizerService => {
  const state = initState(database, fetcher)
  return {
    syncPost: syncPost.bind(null, state),
    syncFeed: syncFeed.bind(null, state),
    syncFeedAndPosts: syncFeedAndPosts.bind(null, state),
    syncSsUrl: syncSsUrl.bind(null, state),
  }
}
