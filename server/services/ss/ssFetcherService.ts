import { ParsedPostWithUrl } from "@shared/post"
import { NotFoundError } from "@shared/errors/notFoundError"
import { ParseError } from "@shared/errors/parseError"
import { UnknownError } from "@shared/errors/unknownError"
import { parsePostDocument } from "../postParser/parsePostDocument"
import { ParsedFeedWithUrl } from "@shared/feed"
import { parseFeedDocument } from "../feedParser/parseFeedDocument"
import { logger } from "../logging/logger"

export interface SSFetcherService {
  fetchParsedPost: (url: string) => Promise<ParsedPostWithUrl>
  fetchParsedFeed: (url: string) => Promise<ParsedFeedWithUrl>
}

const isHostnameSS = (hostname: string): boolean => Boolean(hostname.match(/^(www\.)?ss\.lv$/))

export const getUniqueUrl = (url: string): { urlText: string, url: URL } => {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
    if (!isHostnameSS(parsedUrl.hostname)) throw new ParseError({ entity: 'url', isUserError: true }, new UnknownError('Not a valid ss.lv url', { url }))
  } catch (err) {
    throw new ParseError({ entity: 'url', isUserError: true }, err)
  }
  let uniqueUrl = parsedUrl.origin + parsedUrl.pathname
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

  const response = await fetch(url).catch((err: unknown) => {
    throw new UnknownError('Failed to fetch feed', err, { url })
  })
  
  if (response.status === 404) throw new NotFoundError({ entity: 'feed', id: url })

  const text = await response.text().catch((err: unknown) => {
    throw new ParseError({ entity: 'feed', isUserError: false }, err)
  })

  const data = parseFeedDocument(text)

  return { url, data }
}

export const buildSsFetcherService = (): SSFetcherService => {
  return {
    fetchParsedPost,
    fetchParsedFeed,
  }
}
