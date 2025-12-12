import { ParsedPostWithUrl } from '@shared/post'
import { UnknownError } from '@shared/errors/unknownError'
import { ParseError } from '@shared/errors/parseError'
import { parseAppError } from '@shared/errors/base'
import { z } from 'zod'

const postSchema = z.object({
  url: z.string(),
  data: z.object({
    addressInfo: z.object({
      street: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).nullable().optional(),
    }),
    genericInfo: z.record(z.string(), z.string()),
    price: z.string().nullable().optional(),
    title: z.string().nullable().optional(),  
  }),
})

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

  const parsedPosts: ParsedPostWithUrl[] = await postSchema.array().parseAsync(json).catch(err => {
    throw new ParseError({ entity: 'responseJson', isUserError: false }, err)
  })

  return parsedPosts
}
