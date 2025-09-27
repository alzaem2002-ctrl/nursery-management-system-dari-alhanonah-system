import { Hono } from 'hono'

export const childrenRoutes = new Hono()

// Demo children data
const children = [
  { id: 1, name: 'أحمد محمد', age: 4, parent: 'محمد علي', phone: '0501234567', enrollmentDate: '2024-01-15' },
  { id: 2, name: 'فاطمة أحمد', age: 3, parent: 'أحمد سالم', phone: '0509876543', enrollmentDate: '2024-01-20' },
  { id: 3, name: 'عبدالله يوسف', age: 5, parent: 'يوسف حسن', phone: '0505555555', enrollmentDate: '2024-02-01' }
]

childrenRoutes.get('/', (c) => {
  return c.json({ success: true, data: children })
})

childrenRoutes.post('/', async (c) => {
  const childData = await c.req.json()
  const newChild = {
    id: children.length + 1,
    ...childData,
    enrollmentDate: new Date().toISOString().split('T')[0]
  }
  children.push(newChild)
  return c.json({ success: true, data: newChild })
})