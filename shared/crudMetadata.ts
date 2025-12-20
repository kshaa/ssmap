import z from "zod"

export interface CrudMetadata {
  createdAt: number // Unix timestamp
  updatedAt: number // Unix timestamp
}

export const crudMetadataSchema = z.object({
  createdAt: z.number(),
  updatedAt: z.number(),
})
