import { Hono } from 'hono'

export const authRoutes = new Hono()

// Simple auth endpoint for demo
authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  
  // Demo credentials
  if (email === 'admin@nursery.com' && password === 'admin123') {
    return c.json({
      success: true,
      user: {
        id: '1',
        email: 'admin@nursery.com',
        name: 'المدير العام',
        role: 'admin'
      },
      token: 'demo-jwt-token'
    })
  }
  
  return c.json({ success: false, message: 'بيانات غير صحيحة' }, 401)
})

authRoutes.post('/logout', (c) => {
  return c.json({ success: true })
})