import { Hono } from 'hono'

export const attendanceRoutes = new Hono()

const attendance = [
  { id: 1, childId: 1, date: '2024-01-27', checkinTime: '08:00', checkoutTime: null, status: 'present' },
  { id: 2, childId: 2, date: '2024-01-27', checkinTime: '08:15', checkoutTime: null, status: 'present' },
  { id: 3, childId: 3, date: '2024-01-27', checkinTime: null, checkoutTime: null, status: 'absent' }
]

attendanceRoutes.get('/', (c) => {
  return c.json({ success: true, data: attendance })
})

attendanceRoutes.post('/checkin', async (c) => {
  const { childId } = await c.req.json()
  const today = new Date().toISOString().split('T')[0]
  const time = new Date().toTimeString().split(' ')[0].substring(0, 5)
  
  const newAttendance = {
    id: attendance.length + 1,
    childId,
    date: today,
    checkinTime: time,
    checkoutTime: null,
    status: 'present'
  }
  
  attendance.push(newAttendance)
  return c.json({ success: true, data: newAttendance })
})