import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import { authRoutes } from './routes/auth'
import { childrenRoutes } from './routes/children'
import { employeesRoutes } from './routes/employees'
import { attendanceRoutes } from './routes/attendance'
import { dashboardRoutes } from './routes/dashboard'
import { performanceRoutes } from './routes/performance'
import { settingsRoutes } from './routes/settings'
import { apiRateLimiter } from './middleware/rateLimiter'
import { errorHandler } from './middleware/errorHandler'
import { securityHeaders } from './middleware/security'
import type { CloudflareEnv, User } from './types'

// Type definitions for enhanced application
type Bindings = CloudflareEnv

type Variables = {
  user?: User;
  requestId?: string;
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Apply security headers
app.use('*', securityHeaders())

// Apply rate limiting
app.use('/api/*', apiRateLimiter())

// Enable CORS for API routes
app.use('/api/*', cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://nursery-management-system.pages.dev',
        'https://*.pages.dev', // For preview deployments
        'https://your-custom-domain.com' // Add your custom domain here
      ] 
    : '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Serve manifest.json  
app.get('/manifest.json', (c) => c.text('{}', 200, {'Content-Type': 'application/json'}))



// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/children', childrenRoutes)
app.route('/api/employees', employeesRoutes) 
app.route('/api/attendance', attendanceRoutes)
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/performance', performanceRoutes)
app.route('/api/settings', settingsRoutes)

// Error handling middleware
app.onError(errorHandler)

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  })
})

// Use JSX renderer for main page
app.use(renderer)

// Main application page with Arabic RTL support
app.get('/', (c) => {
  return c.render(
    <div>
      <div id="login-screen">
        <div className="login-container">
          <div className="login-header">
            <i className="fas fa-child"></i>
            <h1>نظام إدارة حضانة الأطفال</h1>
          </div>
          <form className="login-form" id="login-form">
            <div className="form-group">
              <label htmlFor="username">اسم المستخدم</label>
              <input type="text" id="username" placeholder="أدخل اسم المستخدم" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">كلمة المرور</label>
              <input type="password" id="password" placeholder="أدخل كلمة المرور" required />
            </div>
            <button type="submit" className="login-btn">تسجيل الدخول</button>
          </form>
        </div>
      </div>
      
      <div id="app" className="hidden">
        <header>
          <div className="container">
            <div className="header-content">
              <div className="logo">
                <i className="fas fa-child"></i>
                <h1>نظام إدارة حضانة الأطفال</h1>
              </div>
              <nav>
                <ul>
                  <li><a href="#" className="nav-link" data-tab="dashboard"><i className="fas fa-home"></i> الرئيسية</a></li>
                  <li><a href="#" className="nav-link" data-tab="children"><i className="fas fa-child"></i> الأطفال</a></li>
                  <li><a href="#" className="nav-link" data-tab="employees"><i className="fas fa-user-tie"></i> الموظفين</a></li>
                  <li><a href="#" className="nav-link" data-tab="attendance"><i className="fas fa-calendar-check"></i> الحضور</a></li>
                  <li><a href="#" className="nav-link" data-tab="settings"><i className="fas fa-cogs"></i> الإعدادات</a></li>
                  <li><a href="#" id="logout-btn"><i className="fas fa-sign-out-alt"></i> تسجيل الخروج</a></li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        
        <div className="container">
          <div id="dashboard" className="tab-content active">
            <section className="dashboard">
              <div className="card">
                <div className="card-header">
                  <h2>عدد الأطفال</h2>
                  <i className="fas fa-child"></i>
                </div>
                <div className="stat" id="children-count">0</div>
                <div className="card-content">
                  <p>الأطفال المسجلين في الحضانة</p>
                  <a href="#" className="btn nav-link" data-tab="children">إدارة الأطفال</a>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <h2>عدد الموظفين</h2>
                  <i className="fas fa-user-tie"></i>
                </div>
                <div className="stat" id="employees-count">0</div>
                <div className="card-content">
                  <p>الموظفين العاملين في الحضانة</p>
                  <a href="#" className="btn nav-link" data-tab="employees">إدارة الموظفين</a>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <h2>الحضور اليوم</h2>
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat" id="attendance-count">0</div>
                <div className="card-content">
                  <p>عدد الأطفال الحاضرين اليوم</p>
                  <a href="#" className="btn nav-link" data-tab="attendance">سجل الحضور</a>
                </div>
              </div>
            </section>
            
            <section className="content-section">
              <div className="content-header">
                <h2>الأطفال المسجلين حديثاً</h2>
                <a href="#" className="btn" id="add-child-btn">إضافة طفل جديد</a>
              </div>
              <table id="recent-children-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>العمر</th>
                    <th>ولي الأمر</th>
                    <th>الهاتف</th>
                    <th>تاريخ التسجيل</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </section>
          </div>
          

          <div id="children" className="tab-content"></div>
          <div id="employees" className="tab-content"></div>
          <div id="attendance" className="tab-content"></div>
          <div id="settings" className="tab-content"></div>
          <div id="add-child" className="tab-content"></div>
        </div>
        
        <footer>
          <div className="container">
            <p>نظام إدارة حضانة الأطفال © 2025. جميع الحقوق محفوظة.</p>
          </div>
        </footer>
      </div>
    </div>
  )
})

export default app
