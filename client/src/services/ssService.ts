import { ParsedPostWithUrl } from '@shared/post'
import { UnknownError } from '@shared/errors/unknownError'
import { ParseError } from '@shared/errors/parseError'
import { parseAppError } from '@shared/errors/base'
import { parsedPostWithUrlSchema } from '@shared/post'

export const fetchSSPosts = async (requestUrl: string, ssUrl: string): Promise<ParsedPostWithUrl[]> => {
  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: ssUrl }),
  }).catch(err => {
    throw new UnknownError('Failed to fetch posts', err)
  })

  const json = await response.json().catch(err => {
    throw new ParseError({ entity: 'responseBody', isUserError: false }, err)
  })

  const parsedError = parseAppError(json)
  if (parsedError) throw parsedError

  const parsedPosts: ParsedPostWithUrl[] = await parsedPostWithUrlSchema.array().parseAsync(json).catch((err: unknown) => {
    throw new ParseError({ entity: 'responseJson', isUserError: false }, err)
  })

  return parsedPosts
}
