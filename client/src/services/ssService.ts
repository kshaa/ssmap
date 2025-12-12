import { ParsedPostWithUrl } from '@shared/post'
import { UnknownError } from '@shared/errors/unknownError'
import { ParseError } from '@shared/errors/parseError'
import { parseAppError } from '@shared/errors/base'
import { z } from 'zod'

const postSchema = z.object({
  url: z.string(),
  data: z.object({
    addressInfo: z.object({
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
    }),
    genericInfo: z.record(z.string(), z.string()),
    price: z.string().nullable(),
    title: z.string().nullable(),  
  }),
})

export const fetchSSPost = async (requestUrl: string, postUrl: string): Promise<ParsedPostWithUrl> => {
  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: postUrl }),
  }).catch(err => {
    throw new UnknownError('Failed to fetch post', err)
  })

  const json = await response.json().catch(err => {
    throw new ParseError({ entity: 'responseBody', isUserError: false }, err)
  })

  const parsedError = parseAppError(json)
  if (parsedError) throw parsedError

  const parsedPost: ParsedPostWithUrl = await postSchema.parseAsync(json).catch(err => {
    throw new ParseError({ entity: 'responseJson', isUserError: false }, err)
  })

  return parsedPost
}
