// Global Application State
class PharmaApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.charts = {};
        this.syncInterval = null;
        
        this.init();
    }

    init() {
        this.initializeData();
        this.bindEvents();
        this.checkAuth();
        this.startSync();
    }

    // Initialize sample data
    initializeData() {
        if (!localStorage.getItem('pharma_users')) {
            const users = [
                {
                    id: 1,
                    username: 'superadmin',
                    email: 'super@pharma.com',
                    password: 'TempPass123!',
                    role: 'superadmin',
                    mustChangePassword: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    username: 'admin1',
                    email: 'admin@pharma.com',
                    password: 'TempPass123!',
                    role: 'admin',
                    mustChangePassword: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    username: 'user1',
                    email: 'user@pharma.com',
                    password: 'TempPass123!',
                    role: 'user',
                    mustChangePassword: true,
                    createdAt: new Date().toISOString()
                }
            ];

            const company = {
                name: 'PharmaCorp Manufacturing',
                logoUrl: ''
            };

            const materials = [
                {
                    id: 1,
                    name: 'Active Ingredient A',
                    currentStock: 500,
                    minimumStock: 100,
                    unit: 'kg',
                    leadTime: 7,
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Excipient B',
                    currentStock: 50,
                    minimumStock: 150,
                    unit: 'kg',
                    leadTime: 14,
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Coating Material',
                    currentStock: 200,
                    minimumStock: 80,
                    unit: 'L',
                    leadTime: 5,
                    lastUpdated: new Date().toISOString()
                }
            ];

            const equipment = [
                {
                    id: 1,
                    name: 'Tablet Press 1',
                    type: 'Tablet Press',
                    location: 'Production Floor A',
                    status: 'Available'
                },
                {
                    id: 2,
                    name: 'Coating Machine',
                    type: 'Coating Machine',
                    location: 'Production Floor B',
                    status: 'Available'
                },
                {
                    id: 3,
                    name: 'Blender Unit 1',
                    type: 'Blender',
                    location: 'Production Floor A',
                    status: 'Maintenance'
                },
                {
                    id: 4,
                    name: 'Granulator',
                    type: 'Granulator',
                    location: 'Production Floor A',
                    status: 'Available'
                },
                {
                    id: 5,
                    name: 'Capsule Filler',
                    type: 'Capsule Filler',
                    location: 'Production Floor C',
                    status: 'In Use'
                }
            ];

            const productionPlans = [
                {
                    id: 1,
                    drugName: 'Aspirin 100mg',
                    quantity: 10000,
                    month: 'August',
                    year: 2025,
                    status: 'Planned',
                    requestedBy: this.currentUser?.username || 'System',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    drugName: 'Vitamin C 500mg',
                    quantity: 5000,
                    month: 'August',
                    year: 2025,
                    status: 'In Progress',
                    requestedBy: this.currentUser?.username || 'System',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    drugName: 'Paracetamol 500mg',
                    quantity: 8000,
                    month: 'September',
                    year: 2025,
                    status: 'Planned',
                    requestedBy: this.currentUser?.username || 'System',
                    createdAt: new Date().toISOString()
                }
            ];

            // Save to localStorage
            localStorage.setItem('pharma_users', JSON.stringify(users));
            localStorage.setItem('pharma_company', JSON.stringify(company));
            localStorage.setItem('pharma_materials', JSON.stringify(materials));
            localStorage.setItem('pharma_equipment', JSON.stringify(equipment));
            localStorage.setItem('pharma_production_plans', JSON.stringify(productionPlans));
            localStorage.setItem('pharma_calendar', JSON.stringify([]));
            localStorage.setItem('pharma_notifications', JSON.stringify([]));
        }
    }

    // Bind all event listeners
    bindEvents() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachEventListeners());
        } else {
            this.attachEventListeners();
        }
    }

    attachEventListeners() {
        // Dark Mode Toggle
        const darkToggle = document.getElementById('darkModeToggle');
        if (darkToggle) {
            darkToggle.addEventListener('change', (e) => {
                document.body.classList.toggle('dark-mode', e.target.checked);
                localStorage.setItem('darkMode', e.target.checked);
            });
            
            // Load saved dark mode preference
            const savedDarkMode = localStorage.getItem('darkMode') === 'true';
            darkToggle.checked = savedDarkMode;
            document.body.classList.toggle('dark-mode', savedDarkMode);
        }

        // Auth forms
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm')?.addEventListener('submit', (e) => this.handleSignup(e));
        document.getElementById('passwordForm')?.addEventListener('submit', (e) => this.handlePasswordChange(e));

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });

        // Header actions
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        document.getElementById('logoContainer')?.addEventListener('click', () => {
            document.getElementById('logoUpload')?.click();
        });
        document.getElementById('logoUpload')?.addEventListener('change', (e) => this.handleLogoUpload(e));
        document.getElementById('companyName')?.addEventListener('click', () => this.editCompanyName());
        document.getElementById('companyNameInput')?.addEventListener('blur', () => this.saveCompanyName());
        document.getElementById('companyNameInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveCompanyName();
        });

        // Dashboard data info clicks
        document.querySelectorAll('.dashboard-card.clickable').forEach(card => {
            card.addEventListener('click', () => this.showDataInfo(card));
        });

        // Action buttons
        document.getElementById('addProductionBtn')?.addEventListener('click', () => this.openModal('productionModal'));
        document.getElementById('addEquipmentBtn')?.addEventListener('click', () => this.openModal('equipmentModal'));
        document.getElementById('addMaterialBtn')?.addEventListener('click', () => this.openModal('materialModal'));
        document.getElementById('addUserBtn')?.addEventListener('click', () => this.openModal('userModal'));

        // Calendar navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth')?.addEventListener('click', () => this.changeMonth(1));

        // Excel upload
        document.getElementById('uploadExcelBtn')?.addEventListener('click', () => {
            document.getElementById('excelUpload')?.click();
        });
        document.getElementById('excelUpload')?.addEventListener('change', (e) => this.handleExcelUpload(e));

        // Reports
        document.getElementById('exportCSV')?.addEventListener('click', () => this.exportCSV());
        document.getElementById('exportPDF')?.addEventListener('click', () => this.exportPDF());
        document.getElementById('printReport')?.addEventListener('click', () => window.print());

        // Form submissions
        document.getElementById('productionForm')?.addEventListener('submit', (e) => this.addProductionPlan(e));
        document.getElementById('equipmentForm')?.addEventListener('submit', (e) => this.saveEquipment(e));
        document.getElementById('materialForm')?.addEventListener('submit', (e) => this.addMaterial(e));
        document.getElementById('userForm')?.addEventListener('submit', (e) => this.addUser(e));
        document.getElementById('calendarForm')?.addEventListener('submit', (e) => this.saveSchedule(e));

        // Calendar and schedule actions
        document.getElementById('clearSchedule')?.addEventListener('click', () => this.clearSchedule());

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    // Authentication methods
    checkAuth() {
        const savedUser = localStorage.getItem('pharma_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.showMainApp();
            } catch (error) {
                console.error('Auth error:', error);
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.showToast('Please enter both username and password', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('pharma_current_user', JSON.stringify(user));
            
            if (user.mustChangePassword) {
                this.showToast('Login successful! Please change your password.', 'info');
                this.openModal('passwordModal');
            } else {
                this.showToast('Login successful!', 'success');
                this.showMainApp();
            }
        } else {
            this.showToast('Invalid username or password', 'error');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const role = document.getElementById('signupRole').value;

        if (!username || !email || !password) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
        
        if (users.find(u => u.username === username)) {
            this.showToast('Username already exists', 'error');
            return;
        }

        if (users.find(u => u.email === email)) {
            this.showToast('Email already exists', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            role,
            mustChangePassword: true,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('pharma_users', JSON.stringify(users));
        
        this.showToast('Account created successfully! Please login.', 'success');
        this.switchTab('login');
        document.getElementById('signupForm').reset();
    }

    handlePasswordChange(e) {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showToast('Password must be at least 8 characters long', 'error');
            return;
        }

        // Update user password
        const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            users[userIndex].mustChangePassword = false;
            localStorage.setItem('pharma_users', JSON.stringify(users));
            
            this.currentUser = users[userIndex];
            localStorage.setItem('pharma_current_user', JSON.stringify(this.currentUser));
            
            this.closeModal('passwordModal');
            this.showToast('Password changed successfully!', 'success');
            this.showMainApp();
        }
    }

    logout() {
        localStorage.removeItem('pharma_current_user');
        this.currentUser = null;
        this.showLogin();
        this.showToast('Logged out successfully', 'info');
    }

    // UI State Management
    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        this.updateUserInterface();
        this.loadCurrentView();
    }

    updateUserInterface() {
        // Update welcome message
        document.getElementById('welcomeMessage').textContent = `Welcome, ${this.currentUser.username}`;

        // Show/hide role-specific elements
        const adminElements = document.querySelectorAll('.admin-only');
        const superAdminElements = document.querySelectorAll('.superadmin-only');

        adminElements.forEach(el => {
            if (['admin', 'superadmin'].includes(this.currentUser.role)) {
                el.classList.add('show');
                el.style.display = '';
            } else {
                el.classList.remove('show');
                el.style.display = 'none';
            }
        });

        superAdminElements.forEach(el => {
            if (this.currentUser.role === 'superadmin') {
                el.classList.add('show');
                el.style.display = '';
            } else {
                el.classList.remove('show');
                el.style.display = 'none';
            }
        });

        // Load company info
        const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
        document.getElementById('companyName').textContent = company.name || 'PharmaCorp Manufacturing';
        
        if (company.logoUrl) {
            document.getElementById('companyLogo').src = company.logoUrl;
            document.getElementById('companyLogo').classList.remove('hidden');
            document.getElementById('logoPlaceholder').style.display = 'none';
        }
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}Form`).classList.add('active');
    }

    switchView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        document.getElementById(`${view}View`).classList.add('active');
        
        this.loadCurrentView();
    }

    loadCurrentView() {
        switch(this.currentView) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'production':
                this.loadProductionPlans();
                break;
            case 'calendar':
                this.loadCalendar();
                break;
            case 'stock':
                this.loadStockManagement();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'users':
                this.loadUserManagement();
                break;
        }
    }

    // Dashboard Methods
    loadDashboard() {
        const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
        const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
        const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');

        // Update statistics
        const totalProduction = productionPlans.reduce((sum, plan) => sum + plan.quantity, 0);
        document.getElementById('totalProduction').textContent = totalProduction.toLocaleString();

        // Equipment status
        document.getElementById('availableEquipment').textContent = equipment.filter(eq => eq.status === 'Available').length;
        document.getElementById('busyEquipment').textContent = equipment.filter(eq => eq.status === 'In Use').length;
        document.getElementById('maintenanceEquipment').textContent = equipment.filter(eq => eq.status === 'Maintenance').length;

        // Stock alerts
        this.updateStockAlerts(materials);

        // Load charts
        setTimeout(() => {
            this.loadProductionChart(productionPlans);
            this.loadAnalyticsChart(productionPlans);
        }, 100);
    }

    updateStockAlerts(materials) {
        const lowStockMaterials = materials.filter(m => m.currentStock <= m.minimumStock);
        const alertsContainer = document.getElementById('stockAlerts');
        
        if (lowStockMaterials.length === 0) {
            alertsContainer.innerHTML = '<p>✅ All stock levels are adequate</p>';
        } else {
            alertsContainer.innerHTML = lowStockMaterials.map(material => 
                `<div class="alert-item">
                    ⚠️ ${material.name}: ${material.currentStock} ${material.unit} remaining 
                    (minimum: ${material.minimumStock} ${material.unit})
                    <br><small>Lead time: ${material.leadTime} days</small>
                </div>`
            ).join('');

            // Simulate email notification
            this.sendLowStockNotification(lowStockMaterials);
        }
    }

    sendLowStockNotification(lowStockMaterials) {
        // Simulate email to procurement
        const notification = {
            id: Date.now(),
            type: 'low_stock',
            materials: lowStockMaterials,
            sentAt: new Date().toISOString(),
            message: `Low stock alert: ${lowStockMaterials.length} materials need reordering`
        };

        // Save notification (simulating email)
        const notifications = JSON.parse(localStorage.getItem('pharma_notifications') || '[]');
        notifications.push(notification);
        localStorage.setItem('pharma_notifications', JSON.stringify(notifications));

        // Show toast notification
        this.showToast(`📧 Low stock alert sent to procurement team for ${lowStockMaterials.length} materials`, 'warning');
    }

    loadProductionChart(data) {
        const ctx = document.getElementById('productionChart');
        if (!ctx) return;

        // Group data by month
        const monthlyData = {};
        data.forEach(plan => {
            const key = `${plan.month} ${plan.year}`;
            monthlyData[key] = (monthlyData[key] || 0) + plan.quantity;
        });

        const labels = Object.keys(monthlyData);
        const values = Object.values(monthlyData);

        if (this.charts.production) {
            this.charts.production.destroy();
        }

        this.charts.production = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    label: 'Production Units',
                    data: values.length ? values : [0],
                    backgroundColor: 'rgba(37, 99, 235, 0.6)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    loadAnalyticsChart(data) {
        const ctx = document.getElementById('analyticsChart');
        if (!ctx) return;

        // Create trend data
        const monthlyData = {};
        data.forEach(plan => {
            const key = `${plan.month} ${plan.year}`;
            monthlyData[key] = (monthlyData[key] || 0) + plan.quantity;
        });

        const labels = Object.keys(monthlyData);
        const values = Object.values(monthlyData);

        if (this.charts.analytics) {
            this.charts.analytics.destroy();
        }

        this.charts.analytics = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    label: 'Production Trend',
                    data: values.length ? values : [0],
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    showDataInfo(card) {
        if (this.currentUser.role !== 'superadmin') return;

        const source = card.dataset.source;
        const formula = card.dataset.formula;
        
        let data = [];
        let lastUpdated = 'Unknown';
        
        switch(source) {
            case 'production_plans':
                data = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
                lastUpdated = data.length ? new Date(Math.max(...data.map(p => new Date(p.createdAt)))).toLocaleString() : 'No data';
                break;
            case 'equipment':
                data = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
                lastUpdated = 'Static data';
                break;
            case 'materials':
                data = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
                lastUpdated = data.length ? new Date(Math.max(...data.map(m => new Date(m.lastUpdated)))).toLocaleString() : 'No data';
                break;
        }

        document.getElementById('dataSource').textContent = `localStorage.pharma_${source}`;
        document.getElementById('dataFormula').textContent = formula;
        document.getElementById('lastUpdated').textContent = lastUpdated;
        document.getElementById('recordCount').textContent = `${data.length} records`;
        
        this.openModal('dataInfoModal');
    }

    // Production Plans
    loadProductionPlans() {
        const plans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
        const container = document.getElementById('productionPlansList');
        
        if (plans.length === 0) {
            container.innerHTML = '<p>No production plans yet. Click "Add Production Plan" to get started.</p>';
            return;
        }

        container.innerHTML = plans.map(plan => `
            <div class="production-item">
                <div class="item-info">
                    <h4>${plan.drugName}</h4>
                    <p>Quantity: ${plan.quantity.toLocaleString()} units | Target: ${plan.month} ${plan.year} | Status: ${plan.status}</p>
                    <small>Requested by: ${plan.requestedBy}</small>
                </div>
                <div class="item-actions">
                    <button class="btn-secondary" onclick="pharmaApp.editProductionPlan(${plan.id})">Edit</button>
                    <button class="btn-warning" onclick="pharmaApp.deleteProductionPlan(${plan.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    addProductionPlan(e) {
        e.preventDefault();
        
        const drugName = document.getElementById('drugName').value.trim();
        const quantity = parseInt(document.getElementById('drugQuantity').value);
        const month = document.getElementById('targetMonth').value;
        const year = parseInt(document.getElementById('targetYear').value);

        // Check material availability
        const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
        const insufficientMaterials = materials.filter(m => m.currentStock <= m.minimumStock);
        
        if (insufficientMaterials.length > 0) {
            const confirmProceed = confirm(`Warning: The following materials are low in stock:\n${insufficientMaterials.map(m => m.name).join(', ')}\n\nDo you want to proceed anyway?`);
            if (!confirmProceed) return;
        }

        const newPlan = {
            id: Date.now(),
            drugName,
            quantity,
            month,
            year,
            status: 'Planned',
            requestedBy: this.currentUser.username,
            createdAt: new Date().toISOString()
        };

        const plans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
        plans.push(newPlan);
        localStorage.setItem('pharma_production_plans', JSON.stringify(plans));

        this.closeModal('productionModal');
        document.getElementById('productionForm').reset();
        this.loadProductionPlans();
        this.showToast('Production plan added successfully!', 'success');
    }

    deleteProductionPlan(id) {
        if (confirm('Are you sure you want to delete this production plan?')) {
            const plans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
            const filteredPlans = plans.filter(plan => plan.id !== id);
            localStorage.setItem('pharma_production_plans', JSON.stringify(filteredPlans));
            this.loadProductionPlans();
            this.showToast('Production plan deleted', 'info');
        }
    }

    // Equipment Calendar
    loadCalendar() {
        const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
        const calendar = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');
        
        // Update month display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('currentMonthYear').textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const calendarContainer = document.getElementById('equipmentCalendar');
        
        // Set grid columns
        calendarContainer.style.gridTemplateColumns = `150px repeat(${daysInMonth}, 60px)`;
        
        // Clear container
        calendarContainer.innerHTML = '';

        // Add header row
        calendarContainer.innerHTML += '<div class="calendar-header">Equipment</div>';
        for (let day = 1; day <= daysInMonth; day++) {
            calendarContainer.innerHTML += `<div class="calendar-header">${day}</div>`;
        }

        // Add equipment rows
        equipment.forEach(eq => {
            calendarContainer.innerHTML += `
                <div class="equipment-header" ondblclick="pharmaApp.editEquipmentName(${eq.id})" title="Double-click to edit (Super Admin only)">
                    ${eq.name}
                </div>
            `;

            for (let day = 1; day <= daysInMonth; day++) {
                const cellKey = `${eq.id}-${this.currentYear}-${this.currentMonth}-${day}`;
                const schedule = calendar.find(s => s.key === cellKey);
                
                let cellContent = '';
                let cellClass = 'calendar-cell';
                
                if (schedule) {
                    cellClass += ` ${schedule.type}`;
                    cellContent = `
                        <div class="batch-info">${schedule.batchNumber || ''}</div>
                        <div class="batch-notes">${schedule.notes || ''}</div>
                    `;
                }

                // Check for conflicts
                const conflictSchedules = calendar.filter(s => 
                    s.equipmentId === eq.id && 
                    s.year === this.currentYear && 
                    s.month === this.currentMonth && 
                    s.day === day
                );

                if (conflictSchedules.length > 1) {
                    cellClass += ' conflict';
                }

                const canEdit = ['admin', 'superadmin'].includes(this.currentUser.role);
                const onclick = canEdit ? `onclick="pharmaApp.editSchedule(${eq.id}, ${day})"` : '';
                
                calendarContainer.innerHTML += `
                    <div class="${cellClass}" ${onclick} 
                         data-equipment-id="${eq.id}" 
                         data-day="${day}"
                         title="${canEdit ? 'Click to edit schedule' : 'Read-only'}">
                        ${cellContent}
                    </div>
                `;
            }
        });
    }

    changeMonth(direction) {
        this.currentMonth += direction;
        
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        
        this.loadCalendar();
    }

    editEquipmentName(equipmentId) {
        if (this.currentUser.role !== 'superadmin') {
            this.showToast('Only Super Admin can edit equipment names', 'error');
            return;
        }

        const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
        const eq = equipment.find(e => e.id === equipmentId);
        
        if (eq) {
            const newName = prompt('Edit equipment name:', eq.name);
            if (newName && newName.trim() !== eq.name) {
                eq.name = newName.trim();
                localStorage.setItem('pharma_equipment', JSON.stringify(equipment));
                this.loadCalendar();
                this.showToast('Equipment name updated', 'success');
            }
        }
    }

    editSchedule(equipmentId, day) {
        if (!['admin', 'superadmin'].includes(this.currentUser.role)) {
            this.showToast('You do not have permission to edit schedules', 'error');
            return;
        }

        const calendar = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');
        const cellKey = `${equipmentId}-${this.currentYear}-${this.currentMonth}-${day}`;
        const schedule = calendar.find(s => s.key === cellKey);

        // Populate form
        document.getElementById('scheduleEquipmentId').value = equipmentId;
        document.getElementById('scheduleDate').value = `${this.currentYear}-${this.currentMonth}-${day}`;
        document.getElementById('activityType').value = schedule?.type || '';
        document.getElementById('batchNumber').value = schedule?.batchNumber || '';
        document.getElementById('activityNotes').value = schedule?.notes || '';

        this.openModal('calendarModal');
    }

    saveSchedule(e) {
        e.preventDefault();
        
        const equipmentId = parseInt(document.getElementById('scheduleEquipmentId').value);
        const [year, month, day] = document.getElementById('scheduleDate').value.split('-').map(Number);
        const type = document.getElementById('activityType').value;
        const batchNumber = document.getElementById('batchNumber').value.trim();
        const notes = document.getElementById('activityNotes').value.trim();

        const cellKey = `${equipmentId}-${year}-${month}-${day}`;
        let calendar = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');

        // Remove existing schedule for this cell
        calendar = calendar.filter(s => s.key !== cellKey);

        // Add new schedule if type is selected
        if (type) {
            // Check for conflicts
            const existingSchedule = calendar.find(s => 
                s.equipmentId === equipmentId && 
                s.year === year && 
                s.month === month && 
                s.day === day
            );

            if (existingSchedule) {
                const override = confirm('This equipment already has a schedule for this day. Do you want to override it?');
                if (!override) return;
                
                // Remove conflicting schedule
                calendar = calendar.filter(s => 
                    !(s.equipmentId === equipmentId && s.year === year && s.month === month && s.day === day)
                );
            }

            const newSchedule = {
                key: cellKey,
                equipmentId,
                year,
                month,
                day,
                type,
                batchNumber,
                notes,
                scheduledBy: this.currentUser.username,
                scheduledAt: new Date().toISOString()
            };

            calendar.push(newSchedule);
        }

        localStorage.setItem('pharma_calendar', JSON.stringify(calendar));
        this.closeModal('calendarModal');
        this.loadCalendar();
        this.showToast('Schedule updated successfully', 'success');
    }

    clearSchedule() {
        const equipmentId = parseInt(document.getElementById('scheduleEquipmentId').value);
        const [year, month, day] = document.getElementById('scheduleDate').value.split('-').map(Number);
        const cellKey = `${equipmentId}-${year}-${month}-${day}`;

        let calendar = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');
        calendar = calendar.filter(s => s.key !== cellKey);
        localStorage.setItem('pharma_calendar', JSON.stringify(calendar));

        this.closeModal('calendarModal');
        this.loadCalendar();
        this.showToast('Schedule cleared', 'info');
    }

    // Stock Management
    loadStockManagement() {
        const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
        const container = document.getElementById('materialsList');
        
        if (materials.length === 0) {
            container.innerHTML = '<p>No materials in inventory. Click "Add Material" to get started.</p>';
            return;
        }

        container.innerHTML = materials.map(material => {
            const isLowStock = material.currentStock <= material.minimumStock;
            const stockLevel = isLowStock ? 'critical' : (material.currentStock <= material.minimumStock * 1.5 ? 'low' : 'good');
            
            return `
                <div class="material-item ${isLowStock ? 'low-stock' : ''}">
                    <div class="item-info">
                        <h4>${material.name}</h4>
                        <p>Current: ${material.currentStock} ${material.unit} | Minimum: ${material.minimumStock} ${material.unit}</p>
                        <div class="stock-level">
                            <div class="stock-indicator ${stockLevel}"></div>
                            <small>Lead time: ${material.leadTime} days | Last updated: ${new Date(material.lastUpdated).toLocaleDateString()}</small>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="btn-secondary" onclick="pharmaApp.editMaterial(${material.id})">Edit</button>
                        <button class="btn-warning" onclick="pharmaApp.deleteMaterial(${material.id})">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    addMaterial(e) {
        e.preventDefault();
        
        const name = document.getElementById('materialName').value.trim();
        const currentStock = parseFloat(document.getElementById('currentStock').value);
        const minimumStock = parseFloat(document.getElementById('minimumStock').value);
        const unit = document.getElementById('stockUnit').value;
        const leadTime = parseInt(document.getElementById('leadTime').value);

        const newMaterial = {
            id: Date.now(),
            name,
            currentStock,
            minimumStock,
            unit,
            leadTime,
            lastUpdated: new Date().toISOString()
        };

        const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
        materials.push(newMaterial);
        localStorage.setItem('pharma_materials', JSON.stringify(materials));

        this.closeModal('materialModal');
        document.getElementById('materialForm').reset();
        this.loadStockManagement();
        this.showToast('Material added successfully!', 'success');
    }

    deleteMaterial(id) {
        if (confirm('Are you sure you want to delete this material?')) {
            const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
            const filteredMaterials = materials.filter(material => material.id !== id);
            localStorage.setItem('pharma_materials', JSON.stringify(filteredMaterials));
            this.loadStockManagement();
            this.showToast('Material deleted', 'info');
        }
    }

    handleExcelUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                
                const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
                let updatedCount = 0;
                let addedCount = 0;

                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim());
                    if (values.length < headers.length) continue;

                    const materialData = {};
                    headers.forEach((header, index) => {
                        materialData[header.toLowerCase()] = values[index];
                    });

                    // Find existing material or create new one
                    const existingIndex = materials.findIndex(m => 
                        m.name.toLowerCase() === materialData.name?.toLowerCase()
                    );

                    if (existingIndex !== -1) {
                        // Update existing
                        materials[existingIndex].currentStock = parseFloat(materialData.currentstock || materialData.stock);
                        materials[existingIndex].lastUpdated = new Date().toISOString();
                        updatedCount++;
                    } else {
                        // Add new
                        const newMaterial = {
                            id: Date.now() + Math.random(),
                            name: materialData.name,
                            currentStock: parseFloat(materialData.currentstock || materialData.stock || 0),
                            minimumStock: parseFloat(materialData.minimumstock || materialData.minimum || 0),
                            unit: materialData.unit || 'units',
                            leadTime: parseInt(materialData.leadtime || 7),
                            lastUpdated: new Date().toISOString()
                        };
                        materials.push(newMaterial);
                        addedCount++;
                    }
                }

                localStorage.setItem('pharma_materials', JSON.stringify(materials));
                this.loadStockManagement();
                this.showToast(`Excel imported: ${updatedCount} updated, ${addedCount} added`, 'success');
            } catch (error) {
                console.error('Excel import error:', error);
                this.showToast('Error importing Excel file. Please check format.', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    // Equipment Management
    saveEquipment(e) {
        e.preventDefault();
        
        const id = document.getElementById('equipmentId').value;
        const name = document.getElementById('equipmentName').value.trim();
        const type = document.getElementById('equipmentType').value;
        const location = document.getElementById('equipmentLocation').value.trim();
        const status = document.getElementById('equipmentStatus').value;

        const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');

        if (id) {
            // Edit existing
            const index = equipment.findIndex(eq => eq.id == id);
            if (index !== -1) {
                equipment[index] = { id: parseInt(id), name, type, location, status };
                this.showToast('Equipment updated successfully!', 'success');
            }
        } else {
            // Add new
            const newEquipment = {
                id: Date.now(),
                name,
                type,
                location,
                status
            };
            equipment.push(newEquipment);
            this.showToast('Equipment added successfully!', 'success');
        }

        localStorage.setItem('pharma_equipment', JSON.stringify(equipment));
        this.closeModal('equipmentModal');
        document.getElementById('equipmentForm').reset();
        document.getElementById('equipmentId').value = '';
        document.getElementById('equipmentModalTitle').textContent = 'Add Equipment';
        
        if (this.currentView === 'calendar') {
            this.loadCalendar();
        }
    }

    // User Management
    loadUserManagement() {
        if (this.currentUser.role !== 'superadmin') {
            document.getElementById('usersList').innerHTML = '<p>Access denied. Only Super Admin can manage users.</p>';
            return;
        }

        const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
        const container = document.getElementById('usersList');
        
        container.innerHTML = users.map(user => `
            <div class="user-item">
                <div class="item-info">
                    <h4>${user.username}</h4>
                    <p>${user.email} | Role: ${user.role}</p>
                    <small>Created: ${new Date(user.createdAt).toLocaleDateString()}</small>
                </div>
                <div class="item-actions">
                    <button class="btn-secondary" onclick="pharmaApp.editUser(${user.id})">Edit</button>
                    ${user.id !== this.currentUser.id ? `<button class="btn-warning" onclick="pharmaApp.deleteUser(${user.id})">Delete</button>` : ''}
                </div>
