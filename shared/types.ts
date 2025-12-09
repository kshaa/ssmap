// Shared types between client and server

export interface Coordinates {
  lat: number
  lng: number
}

export interface AddressInfo {
  city?: string
  state?: string
  street?: string
  coordinates?: Coordinates
}

export interface GenericInfo {
  [key: string]: string
}

export interface Post {
  status: 'success' | 'fail'
  addressInfo?: AddressInfo
  genericInfo?: GenericInfo
  price?: string | null
  title?: string | null
  url?: string
  message?: string
  stack?: string[]
}

export interface PostWithUI extends Post {
  isOpen?: boolean
}

export interface PostList {
  [url: string]: PostWithUI
}
