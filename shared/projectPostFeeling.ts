import { z } from "zod"

export interface ProjectPostFeeling {
  projectId: string
  postUrl: string
  isSeen: boolean
  stars: number
}

export const projectPostFeelingSchema = z.object({
  projectId: z.string(),
  postUrl: z.string(),
  isSeen: z.boolean(),
  stars: z.number(),
})

export const projectPostFeelingWithoutReferencesSchema = projectPostFeelingSchema.omit({ projectId: true, postUrl: true })
