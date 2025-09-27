import { Hono } from 'hono'
import type { CloudflareEnv } from '../types'

const settingsRoutes = new Hono<{ Bindings: CloudflareEnv }>()

// Get all settings
settingsRoutes.get('/', async (c) => {
  try {
    const db = c.env.DB
    
    // Get all settings from database
    const settings = await db.prepare(`
      SELECT key, value, description, category, input_type, min_value, max_value, options
      FROM settings 
      WHERE is_editable = 1
      ORDER BY category, display_order, key
    `).all()
    
    // Group settings by category
    const groupedSettings = settings.results?.reduce((acc: any, setting: any) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {}) || {}
    
    return c.json({
      success: true,
      data: groupedSettings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return c.json({
      success: false,
      message: 'خطأ في جلب الإعدادات'
    }, 500)
  }
})

// Update settings
settingsRoutes.put('/', async (c) => {
  try {
    const db = c.env.DB
    const body = await c.req.json()
    const { settings } = body
    
    if (!settings || !Array.isArray(settings)) {
      return c.json({
        success: false,
        message: 'بيانات الإعدادات غير صحيحة'
      }, 400)
    }
    
    // Validate and update each setting
    for (const setting of settings) {
      const { key, value } = setting
      
      // Get setting metadata for validation
      const settingMeta = await db.prepare(`
        SELECT input_type, min_value, max_value, options
        FROM settings 
        WHERE key = ? AND is_editable = 1
      `).bind(key).first()
      
      if (!settingMeta) {
        continue // Skip invalid settings
      }
      
      // Validate based on input type
      let validatedValue = value
      
      if (settingMeta.input_type === 'number') {
        const numValue = parseFloat(value)
        if (isNaN(numValue)) {
          return c.json({
            success: false,
            message: `القيمة ${key} يجب أن تكون رقماً`
          }, 400)
        }
        
        if (settingMeta.min_value !== null && numValue < settingMeta.min_value) {
          return c.json({
            success: false,
            message: `القيمة ${key} يجب أن تكون أكبر من ${settingMeta.min_value}`
          }, 400)
        }
        
        if (settingMeta.max_value !== null && numValue > settingMeta.max_value) {
          return c.json({
            success: false,
            message: `القيمة ${key} يجب أن تكون أصغر من ${settingMeta.max_value}`
          }, 400)
        }
        
        validatedValue = numValue.toString()
      }
      
      // Update setting in database
      await db.prepare(`
        UPDATE settings 
        SET value = ?, updated_at = datetime('now')
        WHERE key = ? AND is_editable = 1
      `).bind(validatedValue, key).run()
    }
    
    return c.json({
      success: true,
      message: 'تم تحديث الإعدادات بنجاح'
    })
    
  } catch (error) {
    console.error('Error updating settings:', error)
    return c.json({
      success: false,
      message: 'خطأ في تحديث الإعدادات'
    }, 500)
  }
})

// Get specific setting by key
settingsRoutes.get('/:key', async (c) => {
  try {
    const db = c.env.DB
    const key = c.req.param('key')
    
    const setting = await db.prepare(`
      SELECT * FROM settings WHERE key = ?
    `).bind(key).first()
    
    if (!setting) {
      return c.json({
        success: false,
        message: 'الإعداد غير موجود'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: setting
    })
  } catch (error) {
    console.error('Error fetching setting:', error)
    return c.json({
      success: false,
      message: 'خطأ في جلب الإعداد'
    }, 500)
  }
})

// Reset settings to default
settingsRoutes.post('/reset', async (c) => {
  try {
    const db = c.env.DB
    const body = await c.req.json()
    const { category } = body
    
    let query = `
      UPDATE settings 
      SET value = default_value, updated_at = datetime('now')
      WHERE is_editable = 1
    `
    
    if (category) {
      query += ` AND category = ?`
      await db.prepare(query).bind(category).run()
    } else {
      await db.prepare(query).run()
    }
    
    return c.json({
      success: true,
      message: 'تم استعادة الإعدادات الافتراضية'
    })
  } catch (error) {
    console.error('Error resetting settings:', error)
    return c.json({
      success: false,
      message: 'خطأ في استعادة الإعدادات'
    }, 500)
  }
})

export { settingsRoutes }