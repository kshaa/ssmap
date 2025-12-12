// Shared types between client and server

export interface Coordinates {
  lat: number
  lng: number
}

export interface AddressInfo {
  city?: string | null
  state?: string | null
  street?: string | null
  coordinates?: Coordinates | null
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
