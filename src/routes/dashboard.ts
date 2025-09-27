import { Hono } from 'hono'

export const dashboardRoutes = new Hono()

dashboardRoutes.get('/stats', (c) => {
  return c.json({
    success: true,
    data: {
      totalChildren: 30,
      totalEmployees: 9,
      presentToday: 28,
      totalClasses: 4,
      weeklyAttendance: [28, 30, 27, 29, 28, 26],
      classDistribution: {
        'فصل المرح': 9,
        'فصل الألوان': 4,
        'فصل النجوم': 5,
        'فصل لآلئ البحار': 12
      }
    }
  })
})