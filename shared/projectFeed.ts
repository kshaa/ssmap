import { z } from 'zod'

export interface ProjectFeed {
  projectId: string
  feedUrl: string
}

export const projectFeedSchema = z.object({
  projectId: z.string(),
  feedUrl: z.string(),
})

export type ProjectFeedSchemaType = z.infer<typeof projectFeedSchema>
