import { JSDOM } from 'jsdom'
import { ParseError } from '@shared/errors/parseError'
import { ParsedFeed } from '@shared/feed'

export const parseListingDocument = (document: string): ParsedFeed => {
  const ssdom = new JSDOM(document, {
    contentType: 'text/html',
  })

  try {
    const posts = Array.from(ssdom.window.document.querySelectorAll('tbody > tr:nth-child(n+2) > td:nth-child(2) > a'))
      .map((el) => 'href' in el && typeof el.href === 'string' ? el.href : undefined)
      .filter((href) => href !== undefined)
      .map((href) => ({ url: href }))

    return {
      posts,
    }
  } catch (err: unknown) {
    throw new ParseError({ entity: 'post', isUserError: false }, err)
  }
}