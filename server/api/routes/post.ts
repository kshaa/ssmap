import { ParseError } from '@shared/errors/parseError'
import { createRouter } from '../utils'
import { z } from 'zod'

const post = createRouter()

post.post('/post', async (ctx) => {
  const body = await z.object({ url: z.string() }).parseAsync(ctx.request.body).catch((e) => { throw new ParseError({ entity: 'body', isUserError: true }, e) })
  const post = (await ctx.services.ssSynchronizer.syncPost(body.url))

  ctx.status = 200
  ctx.body = post 
})

export default post
