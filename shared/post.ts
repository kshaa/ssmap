import { z } from 'zod'

export interface Coordinates {
  lat: number
  lng: number
}

type NullableFields<T> = {
  [K in keyof T]: T[K] | null
}

export interface AddressInfo {
  city?: string | null
  state?: string | null
  street?: string | null
  coordinates?: Partial<NullableFields<Coordinates>> | null
}

export interface GenericInfo {
  [key: string]: string
}

export interface ParsedPost {
  addressInfo: AddressInfo
  genericInfo: GenericInfo
  price?: string | null
  title?: string | null
}

export interface ParsedPostWithUrl {
  url: string
  data: ParsedPost
}

export const parsedPostWithUrlSchema = z.object({
  url: z.string(),
  data: z.object({
    addressInfo: z.object({
      street: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      coordinates: z
        .object({
          lat: z.number().nullable().optional(),
          lng: z.number().nullable().optional(),
        })
        .nullable()
        .optional(),
    }),
    genericInfo: z.record(z.string(), z.string()),
    price: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
  }),
})

export type ParsedPostWithUrlSchemaType = z.infer<typeof parsedPostWithUrlSchema>

