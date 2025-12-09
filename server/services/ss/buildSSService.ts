import { ParsedPost, ParsedPostWithUrl } from "@shared/post"
import { BaseError } from "@shared/errors/base"
import { NotFoundError } from "@shared/errors/notFoundError"
import { ParseError } from "@shared/errors/parseError"
import { UnknownError } from "@shared/errors/unknownError"
import { parsePostDocument } from "../postParser/parsePostDocument"

export interface SSService {
  fetchParsedPost: (url: string) => Promise<ParsedPost>
}

const isHostnameSS = (hostname: string): boolean => {
  return !!hostname.match(/^(www\.)?ss\.lv$/)
}

const validateUrl = (url: string): BaseError | null => {
  try {
    if (!isHostnameSS(new URL(url).hostname)) return new ParseError({ entity: 'url', isUserError: true }, new UnknownError('Not a valid ss.lv url', { url }))
  } catch (err) {
    return new ParseError({ entity: 'url', isUserError: true }, err)
  }
  return null
}

const fetchParsedPost = async (url: string): Promise<ParsedPostWithUrl> => {
  const validationError = validateUrl(url)
  if (validationError) throw validationError

  const response = await fetch(url).catch((err: unknown) => {
    throw new UnknownError('Failed to fetch post', err, { url })
  })

  if (response.status === 404) throw new NotFoundError({ entity: 'post', id: url })

  const text = await response.text().catch((err: unknown) => {
    throw new ParseError({ entity: 'post', isUserError: false }, err)
  })

  const parsed = parsePostDocument(text)
  const parsedWithUrl = { ...parsed, url }

  return parsedWithUrl
}

export const buildSSService = () => {
  return {
    fetchParsedPost,
  }
}
