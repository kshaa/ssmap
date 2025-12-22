import { ParseError } from '@shared/errors/parseError'
import { logger } from '../logging/logger'
import { ParsedFeed, PostReference } from '@shared/feed'
import { JSDOM } from 'jsdom'
import { MIN_FEED_TTL_SECONDS } from '../ss/common'

export const getTitle = (feedxml: Document): string => {
  const title = feedxml.querySelector('channel > title')
  if (!title) throw new ParseError({ entity: 'feed', isUserError: false }, new Error('Title not found in feed'))
  const titleText = title.textContent
  if (!titleText) throw new ParseError({ entity: 'feed', isUserError: false }, new Error('Title text not found in feed'))
  return titleText
}

export const getTtlSeconds = (feedxml: Document, minTtlSeconds: number): number => {
  const ttl = feedxml.querySelector('channel > ttl')
  if (!ttl) throw new ParseError({ entity: 'feed', isUserError: false }, new Error('TTL not found in feed'))
  const ttlText = ttl.textContent
  if (!ttlText) throw new ParseError({ entity: 'feed', isUserError: false }, new Error('TTL text not found in feed'))
  let ttlInt = parseInt(ttlText)
  if (isNaN(ttlInt)) throw new ParseError({ entity: 'feed', isUserError: false }, new Error('TTL is not a number'))
  if (!isFinite(ttlInt)) throw new ParseError({ entity: 'feed', isUserError: false }, new Error('TTL is not a finite number'))
  if (ttlInt < minTtlSeconds) {
    logger.warn(`TTL of value ${ttlInt} found which is less than the default ${minTtlSeconds}, using default value instead`)
    ttlInt = minTtlSeconds
  }
  
  return ttlInt
}

export const getPosts = (feedxml: Document): PostReference[] => {
  const posts = feedxml.querySelectorAll('channel > item')
  const references: PostReference[] = []
  if (posts.length === 0) throw new ParseError({ entity: 'feed', isUserError: false }, new Error('No posts found in feed'))
  for (const post of posts) {
    const link = post.querySelector('link')
    if (!link) throw new ParseError({ entity: 'feed', isUserError: false }, new Error('Link not found in post'))
    const url = link.textContent
    if (!url) throw new ParseError({ entity: 'feed', isUserError: false }, new Error('URL not found in post'))
    references.push({ url })
  }
  return references
}

export const parseFeedDocument = (document: string): ParsedFeed => {
  const dom = new JSDOM(document, { contentType: 'text/xml' })
  const feedxml = dom.window.document
  const title = getTitle(feedxml)
  const ttlSeconds = getTtlSeconds(feedxml, MIN_FEED_TTL_SECONDS)
  const posts = getPosts(feedxml)
  return {
    title,
    ttlSeconds,
    posts,
  }
}
