import { ParseError } from '@shared/errors/parseError'
import { createRouter } from '../utils'
import { z } from 'zod'
import { projectPostFeelingWithoutReferencesSchema } from '@shared/projectPostFeeling'

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
  const project = await ctx.services.ssProjectService.getProject(projectId, false)
  ctx.body = project
  ctx.status = 200
})

router.get('/project/:projectId/things/fresh', async (ctx) => {
  const projectId = await z.string().parseAsync(ctx.params.projectId).catch((e) => { throw new ParseError({ entity: 'params', isUserError: true }, e) })
  const project = await ctx.services.ssProjectService.getProject(projectId, true)
  ctx.body = project
  ctx.status = 200
})

router.post('/project/:projectId/thing/rating', async (ctx) => {
  const projectId = await z.string().parseAsync(ctx.params.projectId).catch((e) => { throw new ParseError({ entity: 'params', isUserError: true }, e) })
  const body = await z.object({ postUrl: z.string(), rating: projectPostFeelingWithoutReferencesSchema }).parseAsync(ctx.request.body).catch((e) => { throw new ParseError({ entity: 'body', isUserError: true }, e) })
  await ctx.services.ssProjectService.ratePost(projectId, body.postUrl, body.rating)
  ctx.status = 204
})

export default router
