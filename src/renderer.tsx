import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>نظام إدارة حضانة الأطفال المطور</title>
        <meta name="description" content="نظام شامل لإدارة الحضانات مع مزامنة سحابية وإشعارات فورية" />
        <meta name="keywords" content="حضانة, إدارة, أطفال, تعليم, رعاية" />
        <meta name="author" content="فريق تطوير أنظمة التعليم" />
        
        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="إدارة حضانة" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="152x152" href="/static/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/static/icon-192x192.png" />
        
        {/* Standard Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/static/icon-128x128.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/static/icon-96x96.png" />
        
        {/* Performance Optimizations */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* Security Headers - X-Frame-Options handled by server middleware */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Open Graph */}
        <meta property="og:title" content="نظام إدارة حضانة الأطفال المطور" />
        <meta property="og:description" content="نظام شامل لإدارة الحضانات مع مزامنة سحابية" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/static/icon-512x512.png" />
        
        {/* External CSS libraries with optimized loading */}
        <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
        <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" /></noscript>
        
        {/* Critical CSS - inline for better performance */}
        <style>
          {`
            /* Critical CSS for initial paint */
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
            .hidden { display: none !important; }
            #loadingOverlay { 
              position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
              background: rgba(255,255,255,0.9); display: flex; align-items: center; 
              justify-content: center; z-index: 9999; 
            }
          `}
        </style>
        
        {/* Custom CSS */}
        <link href="/static/styles.css" rel="stylesheet" />
        
        {/* Performance monitoring script */}
        <script>
          {`
            // Critical performance monitoring - inline for early capture
            window.performanceStart = performance.now();
            window.performanceData = {
              navigationStart: performance.timeOrigin,
              errors: []
            };
            
            // Early error capture
            window.addEventListener('error', function(e) {
              window.performanceData.errors.push({
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                timestamp: performance.now()
              });
            });
            
            // Mark DOM content loaded
            document.addEventListener('DOMContentLoaded', function() {
              window.performanceData.domContentLoaded = performance.now();
            });
          `}
        </script>
      </head>
      <body>
        {/* Loading overlay for better UX */}
        <div id="loadingOverlay" style={{ display: 'none' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f4f6', 
              borderTop: '4px solid #3b82f6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px'
            }}></div>
            <p id="loadingMessage" style={{ color: '#6b7280', fontSize: '14px' }}>جاري التحميل...</p>
          </div>
        </div>
        
        {/* Toast notification container */}
        <div id="toastContainer" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: '10000',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}></div>
        
        {children}
        
        {/* External JavaScript libraries with async loading */}
        <script async src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        
        {/* Custom JavaScript - Enhanced version with performance monitoring */}
        <script src="/static/app-enhanced.js"></script>
        
        {/* Loading spinner animation */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            .toast {
              padding: 12px 16px;
              border-radius: 6px;
              color: white;
              font-size: 14px;
              opacity: 0;
              transform: translateX(100%);
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 200px;
              max-width: 400px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .toast.show {
              opacity: 1;
              transform: translateX(0);
            }
            
            .toast-success { background-color: #10b981; }
            .toast-error { background-color: #ef4444; }
            .toast-warning { background-color: #f59e0b; }
            .toast-info { background-color: #3b82f6; }
          `}
        </style>
        
        {/* Performance and analytics tracking - simplified to avoid JSX encoding issues */}
        <script>
          {`// Performance tracking setup
          window.setupPerformanceTracking = function() {
            window.addEventListener('load', function() {
              window.performanceData = window.performanceData || {};
              window.performanceData.loadComplete = performance.now();
              
              // Skip service worker messaging due to encoding issues
              
              console.log('Page Load Performance:', {
                'DOM Content Loaded': (window.performanceData.domContentLoaded || 0) + 'ms',
                'Load Complete': window.performanceData.loadComplete + 'ms',
                'Errors': (window.performanceData.errors || []).length
              });
            });
          };
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', window.setupPerformanceTracking);
          } else {
            window.setupPerformanceTracking();
          }
          `}
        </script>
      </body>
    </html>
  )
})
