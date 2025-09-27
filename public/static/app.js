// Nursery Management System Frontend JavaScript
// Full-featured application with API integration

class NurseryApp {
    constructor() {
        this.apiUrl = '';
        this.authToken = localStorage.getItem('nursery_auth_token');
        this.currentUser = JSON.parse(localStorage.getItem('nursery_user')) || null;
        this.children = [];
        this.employees = [];
        this.attendance = [];
        this.currentChildId = null;
        
        this.init();
    }
    
    init() {
        // Check authentication status
        if (this.authToken && this.currentUser) {
            this.showApp();
            this.loadData();
        } else {
            this.showLogin();
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
        
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Add child buttons
        const addChildBtns = document.querySelectorAll('[id^=\"add-child-btn\"]');
        addChildBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.showAddChildForm(e));
        });
        
        // Cancel add child
        const cancelBtn = document.getElementById('cancel-add-child');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelAddChild());
        }
        
        // Child form submission
        const childForm = document.getElementById('child-form');
        if (childForm) {
            childForm.addEventListener('submit', (e) => this.handleChildSubmit(e));
        }
        
        // Search functionality
        const searchInput = document.getElementById('search-child');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }
    }
    
    // Authentication Methods
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await axios.post(`${this.apiUrl}/api/auth/login`, {
                username,
                password
            });
            
            if (response.data.success) {
                this.authToken = response.data.token;
                this.currentUser = response.data.user;
                
                localStorage.setItem('nursery_auth_token', this.authToken);
                localStorage.setItem('nursery_user', JSON.stringify(this.currentUser));
                
                this.showApp();
                this.loadData();
                this.showMessage('تم تسجيل الدخول بنجاح', 'success');
            } else {
                this.showMessage(response.data.message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('خطأ في تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.', 'error');
        }
    }
    
    handleLogout(e) {
        e.preventDefault();
        
        localStorage.removeItem('nursery_auth_token');
        localStorage.removeItem('nursery_user');
        
        this.authToken = null;
        this.currentUser = null;
        
        location.reload();
    }
    
    // UI Management
    showLogin() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('app').classList.add('hidden');
    }
    
    showApp() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
    }
    
    showTab(tabId) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Update navigation active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-tab=\"${tabId}\"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Load specific data if needed
        if (tabId === 'children') {
            this.renderChildrenTable();
        } else if (tabId === 'employees') {
            this.renderEmployeesTable();
        } else if (tabId === 'attendance') {
            this.renderAttendanceTable();
        }
    }
    
    handleNavigation(e) {
        e.preventDefault();
        const tabId = e.currentTarget.getAttribute('data-tab');
        if (tabId) {
            this.showTab(tabId);
        }
    }
    
    // Data Loading Methods
    async loadData() {
        await Promise.all([
            this.loadDashboardStats(),
            this.loadChildren(),
            this.loadEmployees(),
            this.loadAttendance()
        ]);
        
        this.renderDashboard();
    }
    
    async loadDashboardStats() {
        try {
            const response = await this.apiCall('/api/dashboard/stats');
            if (response.success) {
                const stats = response.data;
                document.getElementById('children-count').textContent = stats.childrenCount;
                document.getElementById('employees-count').textContent = stats.employeesCount;
                document.getElementById('attendance-count').textContent = stats.attendanceCount;
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }
    
    async loadChildren() {
        try {
            const response = await this.apiCall('/api/children');
            if (response.success) {
                this.children = response.data;
                this.renderRecentChildrenTable();
            }
        } catch (error) {
            console.error('Error loading children:', error);
        }
    }
    
    async loadEmployees() {
        try {
            const response = await this.apiCall('/api/employees');
            if (response.success) {
                this.employees = response.data;
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    }
    
    async loadAttendance() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await this.apiCall(`/api/attendance?date=${today}`);
            if (response.success) {
                this.attendance = response.data;
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    }
    
    // API Helper
    async apiCall(url, method = 'GET', data = null) {
        const config = {\n            method,\n            url: `${this.apiUrl}${url}`,\n            headers: {\n                'Content-Type': 'application/json'\n            }\n        };\n        \n        if (this.authToken) {\n            config.headers['Authorization'] = `Bearer ${this.authToken}`;\n        }\n        \n        if (data && (method === 'POST' || method === 'PUT')) {\n            config.data = data;\n        }\n        \n        const response = await axios(config);\n        return response.data;\n    }\n    \n    // Rendering Methods\n    renderDashboard() {\n        this.renderRecentChildrenTable();\n    }\n    \n    renderRecentChildrenTable() {\n        const tbody = document.querySelector('#recent-children-table tbody');\n        if (!tbody) return;\n        \n        tbody.innerHTML = '';\n        \n        // Show last 5 children\n        const recentChildren = this.children.slice(-5).reverse();\n        \n        recentChildren.forEach(child => {\n            const row = document.createElement('tr');\n            row.innerHTML = `\n                <td>${child.name}</td>\n                <td>${child.age} سنوات</td>\n                <td>${child.parent_name}</td>\n                <td>${child.parent_phone}</td>\n                <td>${this.formatDate(child.registration_date)}</td>\n                <td class=\"action-buttons\">\n                    <button title=\"عرض\" onclick=\"nurseryApp.viewChild(${child.id})\"><i class=\"fas fa-eye\"></i></button>\n                    <button title=\"تعديل\" onclick=\"nurseryApp.editChild(${child.id})\"><i class=\"fas fa-edit\"></i></button>\n                </td>\n            `;\n            tbody.appendChild(row);\n        });\n    }\n    \n    renderChildrenTable() {\n        const tbody = document.querySelector('#children-table tbody');\n        if (!tbody) {\n            // Create children table if it doesn't exist\n            this.createChildrenSection();\n            return;\n        }\n        \n        tbody.innerHTML = '';\n        \n        this.children.forEach(child => {\n            const row = document.createElement('tr');\n            row.innerHTML = `\n                <td>${child.name}</td>\n                <td>${child.age} سنوات</td>\n                <td>${child.parent_name}</td>\n                <td>${child.parent_phone}</td>\n                <td>${child.status}</td>\n                <td class=\"action-buttons\">\n                    <button title=\"عرض\" onclick=\"nurseryApp.viewChild(${child.id})\"><i class=\"fas fa-eye\"></i></button>\n                    <button title=\"تعديل\" onclick=\"nurseryApp.editChild(${child.id})\"><i class=\"fas fa-edit\"></i></button>\n                    <button title=\"حذف\" onclick=\"nurseryApp.deleteChild(${child.id})\"><i class=\"fas fa-trash\"></i></button>\n                </td>\n            `;\n            tbody.appendChild(row);\n        });\n    }\n    \n    createChildrenSection() {\n        const childrenTab = document.getElementById('children');\n        childrenTab.innerHTML = `\n            <section class=\"content-section\">\n                <div class=\"content-header\">\n                    <h2>إدارة الأطفال</h2>\n                    <a href=\"#\" class=\"btn\" onclick=\"nurseryApp.showAddChildForm(event)\">إضافة طفل جديد</a>\n                </div>\n                \n                <div class=\"form-row\">\n                    <div class=\"form-group\">\n                        <input type=\"text\" id=\"search-child\" placeholder=\"ابحث عن طفل بالاسم...\">\n                    </div>\n                </div>\n                \n                <table id=\"children-table\">\n                    <thead>\n                        <tr>\n                            <th>الاسم</th>\n                            <th>العمر</th>\n                            <th>ولي الأمر</th>\n                            <th>الهاتف</th>\n                            <th>الحالة</th>\n                            <th>الإجراءات</th>\n                        </tr>\n                    </thead>\n                    <tbody></tbody>\n                </table>\n            </section>\n        `;\n        \n        // Re-bind search event\n        const searchInput = document.getElementById('search-child');\n        if (searchInput) {\n            searchInput.addEventListener('input', (e) => this.handleSearch(e));\n        }\n        \n        this.renderChildrenTable();\n    }\n    \n    createAddChildSection() {\n        const addChildTab = document.getElementById('add-child');\n        addChildTab.innerHTML = `\n            <section class=\"content-section\">\n                <div class=\"content-header\">\n                    <h2>إضافة طفل جديد</h2>\n                </div>\n                <form id=\"child-form\">\n                    <div class=\"form-row\">\n                        <div class=\"form-group\">\n                            <label for=\"childName\">اسم الطفل</label>\n                            <input type=\"text\" id=\"childName\" placeholder=\"أدخل اسم الطفل\" required>\n                        </div>\n                        <div class=\"form-group\">\n                            <label for=\"childAge\">العمر</label>\n                            <input type=\"number\" id=\"childAge\" placeholder=\"أدخل عمر الطفل\" required min=\"1\" max=\"6\">\n                        </div>\n                    </div>\n                    <div class=\"form-row\">\n                        <div class=\"form-group\">\n                            <label for=\"parentName\">اسم ولي الأمر</label>\n                            <input type=\"text\" id=\"parentName\" placeholder=\"أدخل اسم ولي الأمر\" required>\n                        </div>\n                        <div class=\"form-group\">\n                            <label for=\"parentPhone\">هاتف ولي الأمر</label>\n                            <input type=\"tel\" id=\"parentPhone\" placeholder=\"أدخل رقم الهاتف\" required>\n                        </div>\n                    </div>\n                    <div class=\"form-row\">\n                        <div class=\"form-group\">\n                            <label for=\"childAddress\">العنوان</label>\n                            <textarea id=\"childAddress\" rows=\"2\" placeholder=\"أدخل عنوان السكن\"></textarea>\n                        </div>\n                    </div>\n                    <div class=\"form-row\">\n                        <div class=\"form-group\">\n                            <label for=\"childMedical\">الحالة الصحية / ملاحظات</label>\n                            <textarea id=\"childMedical\" rows=\"2\" placeholder=\"أدخل أي ملاحظات طبية أو خاصة\"></textarea>\n                        </div>\n                    </div>\n                    <button type=\"submit\" class=\"btn\">حفظ البيانات</button>\n                    <button type=\"button\" class=\"btn btn-secondary\" onclick=\"nurseryApp.cancelAddChild()\">إلغاء</button>\n                </form>\n            </section>\n        `;\n        \n        // Re-bind form event\n        const childForm = document.getElementById('child-form');\n        if (childForm) {\n            childForm.addEventListener('submit', (e) => this.handleChildSubmit(e));\n        }\n    }\n    \n    renderEmployeesTable() {\n        const employeesTab = document.getElementById('employees');\n        if (employeesTab.innerHTML.trim() === '') {\n            this.createEmployeesSection();\n        }\n    }\n    \n    createEmployeesSection() {\n        const employeesTab = document.getElementById('employees');\n        employeesTab.innerHTML = `\n            <section class=\"content-section\">\n                <div class=\"content-header\">\n                    <h2>إدارة الموظفين</h2>\n                    <a href=\"#\" class=\"btn\">إضافة موظف جديد</a>\n                </div>\n                <table>\n                    <thead>\n                        <tr>\n                            <th>الاسم</th>\n                            <th>المسمى الوظيفي</th>\n                            <th>هاتف</th>\n                            <th>تاريخ التعيين</th>\n                            <th>الحالة</th>\n                            <th>الإجراءات</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        <tr>\n                            <td>فاطمة أحمد</td>\n                            <td>مربية</td>\n                            <td>0551234567</td>\n                            <td>01/01/2023</td>\n                            <td>نشط</td>\n                            <td class=\"action-buttons\">\n                                <button title=\"عرض\"><i class=\"fas fa-eye\"></i></button>\n                                <button title=\"تعديل\"><i class=\"fas fa-edit\"></i></button>\n                                <button title=\"حذف\"><i class=\"fas fa-trash\"></i></button>\n                            </td>\n                        </tr>\n                        <tr>\n                            <td>سارة محمد</td>\n                            <td>إدارية</td>\n                            <td>0557654321</td>\n                            <td>15/03/2023</td>\n                            <td>نشط</td>\n                            <td class=\"action-buttons\">\n                                <button title=\"عرض\"><i class=\"fas fa-eye\"></i></button>\n                                <button title=\"تعديل\"><i class=\"fas fa-edit\"></i></button>\n                                <button title=\"حذف\"><i class=\"fas fa-trash\"></i></button>\n                            </td>\n                        </tr>\n                    </tbody>\n                </table>\n            </section>\n        `;\n    }\n    \n    renderAttendanceTable() {\n        const attendanceTab = document.getElementById('attendance');\n        if (attendanceTab.innerHTML.trim() === '') {\n            this.createAttendanceSection();\n        }\n    }\n    \n    createAttendanceSection() {\n        const attendanceTab = document.getElementById('attendance');\n        const today = new Date().toISOString().split('T')[0];\n        \n        attendanceTab.innerHTML = `\n            <section class=\"content-section\">\n                <div class=\"content-header\">\n                    <h2>سجل الحضور والانصراف</h2>\n                    <a href=\"#\" class=\"btn\">تسجيل حضور جديد</a>\n                </div>\n                <div class=\"form-row\">\n                    <div class=\"form-group\">\n                        <label for=\"attendance-date\">اختر التاريخ</label>\n                        <input type=\"date\" id=\"attendance-date\" value=\"${today}\">\n                    </div>\n                </div>\n                <table>\n                    <thead>\n                        <tr>\n                            <th>اسم الطفل</th>\n                            <th>وقت الحضور</th>\n                            <th>وقت الانصراف</th>\n                            <th>الحالة</th>\n                            <th>ملاحظات</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        <tr>\n                            <td>محمد أحمد</td>\n                            <td>07:30 صباحاً</td>\n                            <td>03:45 مساءً</td>\n                            <td>حاضر</td>\n                            <td>-</td>\n                        </tr>\n                        <tr>\n                            <td>سلمى عبدالله</td>\n                            <td>08:15 صباحاً</td>\n                            <td>04:00 مساءً</td>\n                            <td>حاضر</td>\n                            <td>تأخر في الصباح</td>\n                        </tr>\n                    </tbody>\n                </table>\n            </section>\n        `;\n    }\n    \n    // Child Management Methods\n    showAddChildForm(e) {\n        e.preventDefault();\n        \n        if (document.getElementById('add-child').innerHTML.trim() === '') {\n            this.createAddChildSection();\n        }\n        \n        this.currentChildId = null;\n        document.getElementById('child-form').reset();\n        this.showTab('add-child');\n    }\n    \n    cancelAddChild() {\n        this.currentChildId = null;\n        document.getElementById('child-form').reset();\n        this.showTab('children');\n    }\n    \n    async handleChildSubmit(e) {\n        e.preventDefault();\n        \n        const formData = {\n            name: document.getElementById('childName').value,\n            age: parseInt(document.getElementById('childAge').value),\n            parentName: document.getElementById('parentName').value,\n            parentPhone: document.getElementById('parentPhone').value,\n            address: document.getElementById('childAddress').value,\n            medicalNotes: document.getElementById('childMedical').value\n        };\n        \n        try {\n            let response;\n            if (this.currentChildId) {\n                // Update existing child\n                response = await this.apiCall(`/api/children/${this.currentChildId}`, 'PUT', formData);\n            } else {\n                // Create new child\n                response = await this.apiCall('/api/children', 'POST', formData);\n            }\n            \n            if (response.success) {\n                this.showMessage(response.message, 'success');\n                document.getElementById('child-form').reset();\n                this.currentChildId = null;\n                await this.loadChildren();\n                this.showTab('children');\n            } else {\n                this.showMessage(response.message, 'error');\n            }\n        } catch (error) {\n            console.error('Error saving child:', error);\n            this.showMessage('خطأ في حفظ البيانات', 'error');\n        }\n    }\n    \n    async viewChild(id) {\n        const child = this.children.find(c => c.id === id);\n        if (child) {\n            const message = `معلومات الطفل:\nالاسم: ${child.name}\nالعمر: ${child.age} سنوات\nولي الأمر: ${child.parent_name}\nالهاتف: ${child.parent_phone}\nالعنوان: ${child.address || 'غير محدد'}\nملاحظات طبية: ${child.medical_notes || 'لا يوجد'}`;\n            alert(message);\n        }\n    }\n    \n    async editChild(id) {\n        const child = this.children.find(c => c.id === id);\n        if (child) {\n            if (document.getElementById('add-child').innerHTML.trim() === '') {\n                this.createAddChildSection();\n            }\n            \n            document.getElementById('childName').value = child.name;\n            document.getElementById('childAge').value = child.age;\n            document.getElementById('parentName').value = child.parent_name;\n            document.getElementById('parentPhone').value = child.parent_phone;\n            document.getElementById('childAddress').value = child.address || '';\n            document.getElementById('childMedical').value = child.medical_notes || '';\n            \n            this.currentChildId = child.id;\n            this.showTab('add-child');\n        }\n    }\n    \n    async deleteChild(id) {\n        if (confirm('هل أنت متأكد من حذف هذا الطفل؟')) {\n            try {\n                const response = await this.apiCall(`/api/children/${id}`, 'DELETE');\n                if (response.success) {\n                    this.showMessage(response.message, 'success');\n                    await this.loadChildren();\n                    this.renderChildrenTable();\n                } else {\n                    this.showMessage(response.message, 'error');\n                }\n            } catch (error) {\n                console.error('Error deleting child:', error);\n                this.showMessage('خطأ في حذف الطفل', 'error');\n            }\n        }\n    }\n    \n    handleSearch(e) {\n        const searchText = e.target.value.toLowerCase();\n        const rows = document.querySelectorAll('#children-table tbody tr');\n        \n        rows.forEach(row => {\n            const name = row.cells[0].textContent.toLowerCase();\n            if (name.includes(searchText)) {\n                row.style.display = '';\n            } else {\n                row.style.display = 'none';\n            }\n        });\n    }\n    \n    // Utility Methods\n    formatDate(dateString) {\n        if (!dateString) return '';\n        const date = new Date(dateString);\n        return date.toLocaleDateString('ar-SA');\n    }\n    \n    showMessage(message, type = 'info') {\n        // Remove existing messages\n        const existingMessages = document.querySelectorAll('.message');\n        existingMessages.forEach(msg => msg.remove());\n        \n        const messageDiv = document.createElement('div');\n        messageDiv.className = `message ${type}-message`;\n        messageDiv.textContent = message;\n        \n        const container = document.querySelector('.container');\n        if (container) {\n            container.insertBefore(messageDiv, container.firstChild);\n            \n            // Auto-remove after 5 seconds\n            setTimeout(() => {\n                messageDiv.remove();\n            }, 5000);\n        }\n    }\n}\n\n// Initialize the application\nlet nurseryApp;\ndocument.addEventListener('DOMContentLoaded', function() {\n    nurseryApp = new NurseryApp();\n});