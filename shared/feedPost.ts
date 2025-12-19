import z from "zod"

export interface FeedPost {
  feedUrl: string
  postUrl: string
}

export const feedPostSchema = z.object({
  feedUrl: z.string(),
  postUrl: z.string(),
})

export type FeedPostSchemaType = z.infer<typeof feedPostSchema>
