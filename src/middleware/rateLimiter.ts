import { MiddlewareHandler } from 'hono'

export const apiRateLimiter = (): MiddlewareHandler => {
  return async (c, next) => {
    // Simple rate limiting demo - in production use proper rate limiting
    await next()
  }
}