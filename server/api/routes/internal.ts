import { UnauthorizedError } from '@shared/errors/unauthorizedError'
import { AppContext, createRouter } from '../utils'

const router = createRouter()

const isAdmin = (ctx: AppContext): boolean => {
  const adminHeader = ctx.request.headers['x-admin-password']
  if (!adminHeader) return false
  const adminPassword = ctx.config.adminPassword
  if (!adminPassword) return false
  return adminHeader === adminPassword
}

router.post('/refresh', async (ctx) => {
  // If the request is not from localhost, return 403
  if (!isAdmin(ctx)) throw new UnauthorizedError({ action: 'refresh', hint: `request is not from admin` })
  await ctx.services.ssSynchronizer.syncAllFeedsAndPosts(true)
  ctx.status = 204
})

export default router
