import { ParsedPostWithUrl } from "@shared/post"
import { NotFoundError } from "@shared/errors/notFoundError"
import { ParseError } from "@shared/errors/parseError"
import { UnknownError } from "@shared/errors/unknownError"
import { parsePostDocument } from "../postParser/parsePostDocument"
import { ParsedFeed, ParsedFeedWithUrl, PostReference } from "@shared/feed"
import { parseFeedDocument } from "../feedParser/parseFeedDocument"
import { logger } from "../logging/logger"
import { parseListingDocument } from "../listingParser/parseListingDocument"

export interface SSFetcherService {
  fetchParsedPost: (url: string) => Promise<ParsedPostWithUrl>
  fetchParsedFeed: (url: string) => Promise<ParsedFeedWithUrl>
  fetchParsedListingPage: (url: string) => Promise<ParsedFeedWithUrl>
}

const isHostnameSS = (hostname: string): boolean => Boolean(hostname.match(/^(www\.|m\.)?ss\.(lv|com)$/))

export const getUniqueUrl = (url: string): { urlText: string, url: URL } => {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
    if (!isHostnameSS(parsedUrl.hostname)) throw new ParseError({ entity: 'url', isUserError: true }, new UnknownError('Not a valid ss.lv url', { url }))
  } catch (err) {
    throw new ParseError({ entity: 'url', isUserError: true }, err)
  }
  let normalizedOrigin = parsedUrl.origin.replace('m.', '').replace('.com', '.lv')
  let uniqueUrl = normalizedOrigin + parsedUrl.pathname
  return { urlText: uniqueUrl, url: parsedUrl }
}

const fetchParsedPost = async (rawUrl: string): Promise<ParsedPostWithUrl> => {
  const url = getUniqueUrl(rawUrl).urlText

  logger.info(`Fetching post ${url}`)
  const response = await fetch(url).catch((err: unknown) => {
    throw new UnknownError('Failed to fetch post', err, { url })
  })

  if (response.status === 404) throw new NotFoundError({ entity: 'post', id: url })

  const text = await response.text().catch((err: unknown) => {
    throw new ParseError({ entity: 'post', isUserError: false }, err)
  })

  const data = parsePostDocument(text)

  return { url, data }
}

const fetchParsedFeed = async (rawUrl: string): Promise<ParsedFeedWithUrl> => {
  const url = getUniqueUrl(rawUrl).urlText

  logger.info(`Fetching feed ${url}`)
  const response = await fetch(url).catch((err: unknown) => {
    throw new UnknownError('Failed to fetch feed', err, { url })
  })
  
  if (response.status === 404) throw new NotFoundError({ entity: 'feed', id: url })

  const text = await response.text().catch((err: unknown) => {
    throw new ParseError({ entity: 'feed', isUserError: false }, err)
  })

  const data = parseFeedDocument(text)

  return { url, data, isListingPage: false }
}

const fetchParsedListingPageSingle = async (rawUrl: string): Promise<ParsedFeed> => {
  const url = getUniqueUrl(rawUrl).urlText

  logger.info(`Fetching listing page ${url}`)
  const response = await fetch(url, { redirect: 'manual' }).catch((err: unknown) => {
    throw new UnknownError('Failed to fetch listing page', err, { url })
  })

  if (response.status === 404) throw new NotFoundError({ entity: 'page', id: url })
  if (response.status === 302) throw new NotFoundError({ entity: 'page', id: url, hint: 'Might be an incorrect page number' })

  const text = await response.text().catch((err: unknown) => {
    throw new ParseError({ entity: 'page', isUserError: false }, err)
  })

  return parseListingDocument(text)
}

const fetchParsedListingPage = async (rawUrl: string): Promise<ParsedFeedWithUrl> => {
  const url = getUniqueUrl(rawUrl).urlText
  const urlWithoutTrailingSlash = url.replace(/\/$/, '')

  logger.info(`Fetching listing pages from ${url}`)
  let isDone: boolean = false
  let pageNumber: number = 1
  let posts: PostReference[] = []
  while (!isDone) {
    if (pageNumber > 100) throw new UnknownError('Listing page limit reached', { url })
    const pageUrl = `${urlWithoutTrailingSlash}/page${pageNumber}.html`
    try {
      const data = await fetchParsedListingPageSingle(pageUrl)
      posts.push(...data.posts)
      pageNumber++
    } catch (err) {
      if (err instanceof NotFoundError) {
        isDone = true
      } else {
        throw err
      }
    }
  }

  return { url, isListingPage: true, data: { posts } }
}

export const buildSsFetcherService = (): SSFetcherService => {
  return {
    fetchParsedPost,
    fetchParsedFeed,
    fetchParsedListingPage,
  }
}
