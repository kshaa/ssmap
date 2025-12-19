import { ParseError } from '@shared/errors/parseError'
import { createRouter } from '../utils'
import { z } from 'zod'
import { logger } from '@src/services/logging/logger'
import { v4 as uuidv4 } from 'uuid';

const router = createRouter()

router.post('/project/create', async (ctx) => {
  const body = await z.object({ name: z.string() }).parseAsync(ctx.request.body).catch((e) => { throw new ParseError({ entity: 'body', isUserError: true }, e) })
  const project = await ctx.services.ssProjectService.upsertProject({ id: uuidv4(), name: body.name })

  logger.info(`Created project ${project.id} with name ${project.name}`)
  ctx.body = project
  ctx.status = 200
})

export default router
