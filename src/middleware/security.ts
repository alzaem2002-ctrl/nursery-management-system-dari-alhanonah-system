import { MiddlewareHandler } from 'hono'

export const securityHeaders = (): MiddlewareHandler => {
  return async (c, next) => {
    c.header('X-Content-Type-Options', 'nosniff')
    c.header('X-Frame-Options', 'DENY')
    c.header('X-XSS-Protection', '1; mode=block')
    await next()
  }
}