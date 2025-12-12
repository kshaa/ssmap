export interface PostReference {
  url: string
}

export interface ParsedFeed {
  title: string
  ttlSeconds: number
  posts: PostReference[]
}

export interface ParsedFeedWithUrl {
  url: string
  data: ParsedFeed
}
