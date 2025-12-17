import { ParseError } from '@shared/errors/parseError'
import { createRouter } from '../utils'
import { z } from 'zod'
import { ThingKind } from '@shared/synchronizedThing'
import { logger } from '@src/services/logging/logger'

const post = createRouter()

post.post('/syncUrl', async (ctx) => {
  const body = await z.object({ url: z.string() }).parseAsync(ctx.request.body).catch((e) => { throw new ParseError({ entity: 'body', isUserError: true }, e) })
  const result = (await ctx.services.ssSynchronizer.syncSsUrl(body.url, true))
  logger.info(`Synced url ${body.url} as ${result.kind}`)
  switch (result.kind) {
    case ThingKind.Post:
      ctx.body = [result.data]
      break
    case ThingKind.Feed:
      ctx.body = []
      break
    case ThingKind.FeedAndPosts:
      ctx.body = result.data.posts
      break
    case ThingKind.ListingPage:
      ctx.body = []
      break
    case ThingKind.ListingPageAndPosts:
      ctx.body = result.data.posts
      break
  }

  ctx.status = 200
})

export default post
