import { Hono } from 'hono'

export const employeesRoutes = new Hono()

const employees = [
  { id: 1, name: 'ندى المبيريك', position: 'مديرة المركز', salary: 8000, phone: '0501111111' },
  { id: 2, name: 'صباح الطاهر', position: 'معلمة الحضانة', salary: 5000, phone: '0502222222' },
  { id: 3, name: 'لطيفة السيف', position: 'معلمة التحضيري', salary: 5500, phone: '0503333333' }
]

employeesRoutes.get('/', (c) => {
  return c.json({ success: true, data: employees })
})

employeesRoutes.post('/', async (c) => {
  const employeeData = await c.req.json()
  const newEmployee = {
    id: employees.length + 1,
    ...employeeData
  }
  employees.push(newEmployee)
  return c.json({ success: true, data: newEmployee })
})