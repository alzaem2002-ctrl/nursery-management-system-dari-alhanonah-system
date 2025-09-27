import { ErrorHandler } from 'hono'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error:', err)
  return c.json({
    success: false,
    message: 'حدث خطأ في النظام',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  }, 500)
}