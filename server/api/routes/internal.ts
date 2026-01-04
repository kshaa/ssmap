import { UnauthorizedError } from '@shared/errors/unauthorizedError'
import { createRouter } from '../utils'

const router = createRouter()

const isLocalhost = (ip: string): boolean => {
  // IPv4 localhost
  if (ip === '127.0.0.1') return true
  // IPv6 localhost
  if (ip === '::1') return true
  // IPv6-mapped IPv4 localhost (e.g., ::ffff:127.0.0.1)
  if (ip === '::ffff:127.0.0.1' || ip.startsWith('::ffff:127.0.0.1')) return true
  return false
}

router.post('/refresh', async (ctx) => {
  // If the request is not from localhost, return 403
  if (!isLocalhost(ctx.ip)) {
    throw new UnauthorizedError({ action: 'refresh', hint: `ip is ${ctx.ip}` })
  }
  await ctx.services.ssSynchronizer.syncAllFeedsAndPosts(true)
  ctx.status = 204
})

export default router
