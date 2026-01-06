import { z } from 'zod'

export interface StructuredPrice {
  amount: number
  currency?: string
  period?: string
}

export interface AreaStructured {
  amount: number
  unit: string
}

export const areaStructuredSchema = z.object({
  amount: z.number(),
  unit: z.string(),
})

export const structuredPriceSchema = z.object({
  amount: z.number(),
  currency: z.string().optional(),
  period: z.string().optional(),
})

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

export const addressInfoSchema = z.object({
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
})

export interface GenericInfo {
  [key: string]: string
}

export const genericInfoSchema = z.record(z.string(), z.string())

export interface ParsedPost {
  addressInfo: AddressInfo
  genericInfo: GenericInfo
  areaStructured?: AreaStructured | null
  price?: string | null
  priceStructured?: StructuredPrice | null
  title?: string | null
}

export const parsedPostSchema = z.object({
  addressInfo: addressInfoSchema,
  genericInfo: genericInfoSchema,
  areaStructured: areaStructuredSchema.nullable().optional(),
  price: z.string().nullable().optional(),
  priceStructured: structuredPriceSchema.nullable().optional(),
  title: z.string().nullable().optional(),
}) satisfies z.ZodType<ParsedPost>

export interface ParsedPostWithUrl {
  url: string
  data: ParsedPost
}

export const parsedPostWithUrlSchema = z.object({
  url: z.string(),
  data: parsedPostSchema,
})

export type ParsedPostWithUrlSchemaType = z.infer<typeof parsedPostWithUrlSchema>

