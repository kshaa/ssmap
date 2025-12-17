import { getUniqueUrl } from "./ssFetcherService"
import { ThingKind } from "@shared/synchronizedThing"

export const urlInspect = (rawUrl: string, isDeepSearch: boolean): { kind: ThingKind, url: string } => {
  // Parse whether a URL is syntactically valid and from SS.lv
  const { urlText, url } = getUniqueUrl(rawUrl)

  if (url.pathname.includes('/rss/')) {
    // Seems like an RSS feed, let's either sync the feed itself or it and its posts
    return { kind: isDeepSearch ? ThingKind.FeedAndPosts : ThingKind.Feed, url: urlText }
  }
  
  const parts = url.pathname.split('/')
  const lastPart = (parts.length > 0 ? parts[parts.length - 1] : undefined) ?? ''
  if (lastPart === '' || lastPart.match(/page[0-9]*\.html/)) {
    // Seems like a listing page
    const firstPageUrl = urlText.replace(/page[0-9]*\.html/, '')
    return { kind: isDeepSearch ? ThingKind.ListingPageAndPosts : ThingKind.ListingPage, url: firstPageUrl }
  }
  
  if (url.pathname.endsWith('.html')) {
    // Seems like a post, let's sync it
    return { kind: ThingKind.Post, url: urlText }
  }
  
  // Seems like something else, let's assume it's a listing page
  // If this assumption is wrong, we'll just fail later and it's fine
  // But if it's a listing page, we can append /rss/ to it and try parsing it as a feed
  // Remove trailing slash if present to avoid double slashes
  return { kind: isDeepSearch ? ThingKind.ListingPageAndPosts : ThingKind.ListingPage, url: urlText }
}
