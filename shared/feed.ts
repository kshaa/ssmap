import z from "zod"

export interface PostReference {
  url: string
}

export const postReferenceSchema = z.object({
  url: z.string(),
})

export interface ParsedFeed {
  title?: string
  ttlSeconds?: number
  posts: PostReference[]
}

export const parsedFeedSchema = z.object({
  title: z.string().nullable().optional(),
  ttlSeconds: z.number().nullable().optional(),
  posts: postReferenceSchema.array(),
})

export interface ParsedFeedWithUrl {
  url: string
  isListingPage: boolean
  data: ParsedFeed
}

export const parsedFeedWithUrlSchema = z.object({
  url: z.string(),
  isListingPage: z.boolean(),
  data: parsedFeedSchema,
})

export type ParsedFeedWithUrlSchemaType = z.infer<typeof parsedFeedWithUrlSchema>