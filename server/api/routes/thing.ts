import { ParseError } from '@shared/errors/parseError'
import { createRouter } from '../utils'
import { z } from 'zod'

const router = createRouter()

router.post('/project/:projectId/thing', async (ctx) => {
  const projectId = await z.string().parseAsync(ctx.params.projectId).catch((e) => { throw new ParseError({ entity: 'params', isUserError: true }, e) })
  const body = await z.object({ url: z.string() }).parseAsync(ctx.request.body).catch((e) => { throw new ParseError({ entity: 'body', isUserError: true }, e) })
  const thing = await ctx.services.ssProjectService.addThing(projectId, body.url)
  ctx.status = 200
  ctx.body = thing
})

router.get('/project/:projectId/things', async (ctx) => {
  const projectId = await z.string().parseAsync(ctx.params.projectId).catch((e) => { throw new ParseError({ entity: 'params', isUserError: true }, e) })
  const project = await ctx.services.ssProjectService.getProject(projectId)
  ctx.body = project
  ctx.status = 200
})

export default router
