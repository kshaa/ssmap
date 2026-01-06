import { ParsedPostWithUrl } from "@shared/post"
import { ParsedFeedWithUrl } from "@shared/feed"
import { getUniqueUrl, SSFetcherService } from "./ssFetcherService"
import { DatabaseService } from "../database/initDatabase"
import PQueue from "p-queue"
import { MIN_FEED_TTL_SECONDS, MIN_POST_TTL_SECONDS, SYNC_INTERVAL_SECONDS } from "./common"
import { CrudMetadata } from "@shared/crudMetadata"
import { PostSync, FeedSync, FeedAndPostsSync, ThingSync, WithStaleness, ThingKind, Staleness } from "@shared/synchronizedThing"
import { logger } from "../logging/logger"
import { urlInspect } from "./urlInspect"
import { FeedPost } from "@shared/feedPost"

export interface SSSynchronizerService {
  syncPost: (postUrl: string, isForced: boolean) => Promise<PostSync>
  syncFeed: (feedUrl: string, isListingPage: boolean, isForced: boolean) => Promise<FeedSync>
  syncFeedAndPosts: (feedUrl: string, isListingPage: boolean, isForced: boolean) => Promise<FeedAndPostsSync>
  syncSsUrl: (url: string, isDeepSearch: boolean, isForced: boolean) => Promise<ThingSync>
  syncAllFeedsAndPosts: (isForced: boolean) => Promise<void>
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
  const queue = new PQueue({ concurrency: 15 })

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

const syncPost = async (state: State, rawPostUrl: string, isForced: boolean): Promise<ParsedPostWithUrl & CrudMetadata & WithStaleness> => {
  return await state.queue.add(async () => {
    logger.debug(`Syncing post ${rawPostUrl}`)
    // Normalize the URL
    const postUrl = getUniqueUrl(rawPostUrl).urlText
    // Fetch, maybe we have that post in the database already
    const existingPost = await state.database.tables.post.get(postUrl)
    // If we do and it's not stale, return it
    if (existingPost && !isStale(existingPost.updatedAt, MIN_POST_TTL_SECONDS) && !isForced) return { ...existingPost, staleness: Staleness.Cached }
    // If it does not exist or is stale, fetch it
    const post = await state.fetcher.fetchParsedPost(postUrl)
    // Upsert the post into the database
    const persistedPost = await state.database.tables.post.upsert(postUrl, post.data)
    // If the post content has changed, update all project posts that reference this post
    const isUpdated = existingPost && JSON.stringify(existingPost.data) !== JSON.stringify(post.data)
    if (isUpdated) {
      logger.info(`Post ${postUrl} has changed, updating all project posts that reference it`)
      const projectPostsFeelings = await state.database.tables.projectPostFeeling.getByPostUrl(postUrl)
      logger.info(`Found ${projectPostsFeelings.length} project posts that reference this post, updating`)
      for (const projectPostFeeling of projectPostsFeelings) {
        await state.database.tables.projectPostFeeling.upsert(projectPostFeeling.projectId, projectPostFeeling.postUrl, { ...projectPostFeeling, isSeen: false }).catch((err) => {
          logger.error(`Failed to update project post feeling ${projectPostFeeling.projectId} ${projectPostFeeling.postUrl}`, err)
        })
      }
    }
    // Return the persisted post with timestamps
    return { ...persistedPost, staleness: existingPost ? Staleness.Refreshed : Staleness.FreshlyFetched }
  })
}

const syncFeed = async (state: State, rawFeedUrl: string, isListingPage: boolean, isForced: boolean): Promise<ParsedFeedWithUrl & CrudMetadata & WithStaleness> => {
  return await state.queue.add(async () => {
    logger.info(`Syncing feed ${rawFeedUrl}`)
    // Normalize the URL
    const feedUrl = getUniqueUrl(rawFeedUrl).urlText
    // Fetch, maybe we have that feed in the database already
    const existingFeed = await state.database.tables.feed.get(feedUrl)
    // If we do and it's not stale, return it
    if (existingFeed && !isStale(existingFeed.updatedAt, existingFeed.data.ttlSeconds ?? MIN_FEED_TTL_SECONDS) && !isForced) return { ...existingFeed, staleness: Staleness.Cached }
    // If it does not exist or is stale, fetch it
    const feed = isListingPage ? await state.fetcher.fetchParsedListingPage(feedUrl) : await state.fetcher.fetchParsedFeed(feedUrl)
    // Upsert the feed into the database
    const persistedFeed = await state.database.tables.feed.upsert(feedUrl, feed.data, isListingPage)
    // Return the persisted feed with timestamps
    return { ...persistedFeed, staleness: existingFeed ? Staleness.Refreshed : Staleness.FreshlyFetched }
  })
}

const syncFeedAndPosts = async (state: State, rawFeedUrl: string, isListingPage: boolean, isForced: boolean): Promise<{ feed: ParsedFeedWithUrl & CrudMetadata, posts: (ParsedPostWithUrl & CrudMetadata)[], feedPosts: (FeedPost & CrudMetadata)[] }> => {
  logger.info(`Syncing feed and posts ${rawFeedUrl}`)
  const feed = await syncFeed(state, rawFeedUrl, isListingPage, isForced)

  logger.info(`Syncing feeds posts from ${rawFeedUrl} (${feed.data.posts.length} posts)`)
  const posts = await Promise.all(feed.data.posts.map(post => syncPost(state, post.url, isForced)))

  // TODO: DB should support batching (but I'm not going for performance right now)
  const feedPosts = await Promise.all(posts.map(post => state.database.tables.feedPost.upsert(feed.url, post.url)))

  return { feed, posts, feedPosts }
}

const syncSsUrl = async (state: State, url: string, isDeepSearch: boolean, isForced: boolean): Promise<ThingSync> => {
  const { kind, url: urlText } = urlInspect(url, isDeepSearch)
  logger.info(`Syncing url ${url} as ${kind}`)
  switch (kind) {
    case ThingKind.Post:
      return { kind: ThingKind.Post, data: await syncPost(state, urlText, isForced) }
    case ThingKind.Feed:
      return { kind: ThingKind.Feed, data: await syncFeed(state, urlText, false, isForced) }
    case ThingKind.FeedAndPosts:
      return { kind: ThingKind.FeedAndPosts, data: await syncFeedAndPosts(state, urlText, false, isForced) }
    case ThingKind.ListingPage:
      return { kind: ThingKind.Feed, data: await syncFeed(state, urlText, true, isForced) }
    case ThingKind.ListingPageAndPosts:
      return { kind: ThingKind.FeedAndPosts, data: await syncFeedAndPosts(state, urlText, true, isForced) }
  }
}

const syncAllFeedsAndPosts = async (state: State, isForced: boolean): Promise<void> => {
  logger.info('Running SS Synchronizer Job')

  // Synchronizing feeds
  const feeds = await state.database.tables.feed.getAll()
  for (const feed of feeds) {
    await syncFeed(state, feed.url, feed.isListingPage, isForced).catch((err) => {
      logger.error(`Failed to sync feed ${feed.url}`, err)
    })
  }

  // Synchronizing posts
  const posts = await state.database.tables.post.getAll()
  for (const post of posts) {
    await syncPost(state, post.url, isForced).catch((err) => {
      logger.error(`Failed to sync post ${post.url}`, err)
    })
  }

  logger.info('SS Synchronizer Job completed')
}

export const buildSsSynchronizerService = (database: DatabaseService, fetcher: SSFetcherService): SSSynchronizerService => {
  const state = initState(database, fetcher)
  return {
    syncPost: syncPost.bind(null, state),
    syncFeed: syncFeed.bind(null, state),
    syncFeedAndPosts: syncFeedAndPosts.bind(null, state),
    syncSsUrl: syncSsUrl.bind(null, state),
    syncAllFeedsAndPosts: syncAllFeedsAndPosts.bind(null, state),
  }
}

export const runSsSynchronizerJob = (ssSynchronizer: SSSynchronizerService): void => {
  const queue = new PQueue({ concurrency: 1 })
  setInterval(() => {
    queue.add(() => ssSynchronizer.syncAllFeedsAndPosts(false))
  }, SYNC_INTERVAL_SECONDS * 1000)
}