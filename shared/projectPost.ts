import { z } from 'zod'
export interface ProjectPost {
  projectId: string
  postUrl: string
}

export const projectPostSchema = z.object({
  projectId: z.string(),
  postUrl: z.string(),
})

export type ProjectPostSchemaType = z.infer<typeof projectPostSchema>