import { Hono } from 'hono'

export const performanceRoutes = new Hono()

performanceRoutes.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})