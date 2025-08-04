// Global Application State
class PharmaApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.charts = {};
        
        this.init();
    }

    init() {
        console.log('Initializing Pharma App...');
        this.initializeData();
        this.bindEvents();
        this.checkAuth();
    }

    // Initialize sample data
    initializeData() {
        if (!localStorage.getItem('pharma_users')) {
            console.log('Initializing sample data...');
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
                    requestedBy: 'BD Team',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    drugName: 'Vitamin C 500mg',
                    quantity: 5000,
                    month: 'August',
                    year: 2025,
                    status: 'In Progress',
                    requestedBy: 'BD Team',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    drugName: 'Paracetamol 500mg',
                    quantity: 8000,
                    month: 'September',
                    year: 2025,
                    status: 'Planned',
                    requestedBy: 'BD Team',
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
            
            console.log('Sample data initialized successfully');
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
        console.log('Attaching event listeners...');

        // **FIXED: Dark Mode Toggle**
        const darkToggle = document.getElementById('darkModeToggle');
        if (darkToggle) {
            darkToggle.addEventListener('change', (e) => {
                console.log('Dark mode toggled:', e.target.checked);
                document.body.classList.toggle('dark-mode', e.target.checked);
                localStorage.setItem('darkMode', e.target.checked);
            });
            
            // Load saved dark mode preference
            const savedDarkMode = localStorage.getItem('darkMode') === 'true';
            darkToggle.checked = savedDarkMode;
            document.body.classList.toggle('dark-mode', savedDarkMode);
            console.log('Dark mode initialized:', savedDarkMode);
        }

        // **FIXED: Auth forms**
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            console.log('Login form listener attached');
        }

        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
            console.log('Signup form listener attached');
        }

        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
            console.log('Password form listener attached');
        }

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });

        // Header actions
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        const logoContainer = document.getElementById('logoContainer');
        if (logoContainer) {
            logoContainer.addEventListener('click', () => {
                document.getElementById('logoUpload')?.click();
            });
        }

        const logoUpload = document.getElementById('logoUpload');
        if (logoUpload) {
            logoUpload.addEventListener('change', (e) => this.handleLogoUpload(e));
        }

        const companyName = document.getElementById('companyName');
        if (companyName) {
            companyName.addEventListener('click', () => this.editCompanyName());
        }

        const companyNameInput = document.getElementById('companyNameInput');
        if (companyNameInput) {
            companyNameInput.addEventListener('blur', () => this.saveCompanyName());
            companyNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.saveCompanyName();
            });
        }

        // **FIXED: Modal triggers**
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

        // **FIXED: Reports**
        document.getElementById('exportCSV')?.addEventListener('click', () => this.exportCSV());
        document.getElementById('exportPDF')?.addEventListener('click', () => this.exportPDF());
        document.getElementById('printReport')?.addEventListener('click', () => window.print());

        // **FIXED: Form submissions**
        document.getElementById('productionForm')?.addEventListener('submit', (e) => this.addProductionPlan(e));
        document.getElementById('equipmentForm')?.addEventListener('submit', (e) => this.saveEquipment(e));
        document.getElementById('materialForm')?.addEventListener('submit', (e) => this.addMaterial(e));
        document.getElementById('userForm')?.addEventListener('submit', (e) => this.addUser(e));
        document.getElementById('calendarForm')?.addEventListener('submit', (e) => this.saveSchedule(e));

        // Calendar and schedule actions
        document.getElementById('clearSchedule')?.addEventListener('click', () => this.clearSchedule());

        // **FIXED: Modal close handlers**
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
        });

        // Dashboard data info clicks
        document.querySelectorAll('.dashboard-card.clickable').forEach(card => {
            card.addEventListener('click', () => this.showDataInfo(card));
        });

        console.log('All event listeners attached successfully');
    }

    // Authentication methods
    checkAuth() {
        const savedUser = localStorage.getItem('pharma_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('User found in storage:', this.currentUser.username);
                this.showMainApp();
            } catch (error) {
                console.error('Auth error:', error);
                this.showLogin();
            }
        } else {
            console.log('No saved user found, showing login');
            this.showLogin();
        }
    }

    handleLogin(e) {
        e.preventDefault();
        console.log('Login form submitted');
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        console.log('Login attempt for username:', username);

        if (!username || !password) {
            this.showToast('Please enter both username and password', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
        console.log('Available users:', users.map(u => u.username));
        
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            console.log('Login successful for user:', user.username);
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
            console.log('Login failed - invalid credentials');
            this.showToast('Invalid username or password', 'error');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        console.log('Signup form submitted');
        
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const role = document.getElementById('signupRole').value;

        console.log('Signup attempt for username:', username);

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
        
        console.log('User created successfully:', username);
        this.showToast('Account created successfully! Please login.', 'success');
        this.switchTab('login');
        document.getElementById('signupForm').reset();
    }

    handlePasswordChange(e) {
        e.preventDefault();
        console.log('Password change form submitted');
        
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
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
        
        console.log('Login screen shown');
    }

    showMainApp() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) loginScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        
        this.updateUserInterface();
        this.loadCurrentView();
        
        console.log('Main app shown');
    }

    updateUserInterface() {
        // Update welcome message
        const welcomeMsg = document.getElementById('welcomeMessage');
        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome, ${this.currentUser.username}`;
        }

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
        const companyNameEl = document.getElementById('companyName');
        if (companyNameEl) {
            companyNameEl.textContent = company.name || 'PharmaCorp Manufacturing';
        }
        
        if (company.logoUrl) {
            const logoEl = document.getElementById('companyLogo');
            const placeholderEl = document.getElementById('logoPlaceholder');
            if (logoEl && placeholderEl) {
                logoEl.src = company.logoUrl;
                logoEl.classList.remove('hidden');
                placeholderEl.style.display = 'none';
            }
        }
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
        const tabForm = document.getElementById(`${tab}Form`);
        
        if (tabBtn) tabBtn.classList.add('active');
        if (tabForm) tabForm.classList.add('active');
    }

    switchView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        
        const navBtn = document.querySelector(`[data-view="${view}"]`);
        const viewEl = document.getElementById(`${view}View`);
        
        if (navBtn) navBtn.classList.add('active');
        if (viewEl) viewEl.classList.add('active');
        
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
        console.log('Loading dashboard...');
        
        const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
        const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
        const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');

        // Update statistics
        const totalProduction = productionPlans.reduce((sum, plan) => sum + plan.quantity, 0);
        const totalProductionEl = document.getElementById('totalProduction');
        if (totalProductionEl) {
            totalProductionEl.textContent = totalProduction.toLocaleString();
        }

        // Equipment status
        const availableEl = document.getElementById('availableEquipment');
        const busyEl = document.getElementById('busyEquipment');
        const maintenanceEl = document.getElementById('maintenanceEquipment');
        
        if (availableEl) availableEl.textContent = equipment.filter(eq => eq.status === 'Available').length;
        if (busyEl) busyEl.textContent = equipment.filter(eq => eq.status === 'In Use').length;
        if (maintenanceEl) maintenanceEl.textContent = equipment.filter(eq => eq.status === 'Maintenance').length;

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
        
        if (!alertsContainer) return;
        
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

    // **FIXED: Production Plans**
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

    // **FIXED: Equipment Calendar - FULLY FUNCTIONAL**
    loadCalendar() {
        const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
        const calendar = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');
        
        // Update month display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthYearEl = document.getElementById('currentMonthYear');
        if (monthYearEl) {
            monthYearEl.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }

        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const calendarContainer = document.getElementById('equipmentCalendar');
        
        if (!calendarContainer) return;
        
        // Set grid columns: equipment header + days
        calendarContainer.style.gridTemplateColumns = `120px repeat(${daysInMonth}, 60px)`;
        
        // Clear container
        calendarContainer.innerHTML = '';

        // Add header row
        calendarContainer.innerHTML += '<div class="calendar-header">Equipment</div>';
        for (let day = 1; day <= daysInMonth; day++) {
            calendarContainer.innerHTML += `<div class="calendar-header">${day}</div>`;
        }

        // Add equipment rows
        equipment.forEach(eq => {
            // Equipment name header
            const canEdit = this.currentUser.role === 'superadmin';
            const editHandler = canEdit ? `ondblclick="pharmaApp.editEquipmentName(${eq.id})"` : '';
            const editTitle = canEdit ? 'Double-click to edit (Super Admin only)' : 'Read-only';
            
            calendarContainer.innerHTML += `
                <div class="equipment-header" ${editHandler} title="${editTitle}">
                    ${eq.name}
                </div>
            `;

            // Day cells
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

                // Check for conflicts (multiple schedules on same day)
                const conflictSchedules = calendar.filter(s => 
                    s.equipmentId === eq.id && 
                    s.year === this.currentYear && 
                    s.month === this.currentMonth && 
                    s.day === day
                );

                if (conflictSchedules.length > 1) {
                    cellClass += ' conflict';
                }

                // Add click handler for admin/superadmin
                const canSchedule = ['admin', 'superadmin'].includes(this.currentUser.role);
                const clickHandler = canSchedule ? `onclick="pharmaApp.editSchedule(${eq.id}, ${day})"` : '';
                const clickTitle = canSchedule ? 'Click to edit schedule' : 'Read-only';
                
                calendarContainer.innerHTML += `
                    <div class="${cellClass}" ${clickHandler}
                         data-equipment-id="${eq.id}" 
                         data-day="${day}"
                         title="${clickTitle}">
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

    // **FIXED: Stock Management**
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

    // **FIXED: Equipment Management**
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

    // **FIXED: User Management**
    loadUserManagement() {
        if (this.currentUser.role !== 'superadmin') {
            const container = document.getElementById('usersList');
            container.innerHTML = '<p>Access denied. Only Super Admin can manage users.</p>';
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
            </div>
        `).join('');
    }

    addUser(e) {
        e.preventDefault();
        
        const username = document.getElementById('newUsername').value.trim();
        const email = document.getElementById('newUserEmail').value.trim();
        const password = document.getElementById('newUserPassword').value;
        const role = document.getElementById('newUserRole').value;

        const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
        
        if (users.find(u => u.username === username)) {
            this.showToast('Username already exists', 'error');
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

        this.closeModal('userModal');
        document.getElementById('userForm').reset();
        this.loadUserManagement();
        this.showToast('User added successfully!', 'success');
    }

    deleteUser(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
            const filteredUsers = users.filter(user => user.id !== id);
            localStorage.setItem('pharma_users', JSON.stringify(filteredUsers));
            this.loadUserManagement();
            this.showToast('User deleted', 'info');
        }
    }

    // **FIXED: Reports**
    loadReports() {
        const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
        const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
        const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
        const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');

        const totalUnits = productionPlans.reduce((sum, plan) => sum + plan.quantity, 0);
        const activeEquipment = equipment.filter(eq => eq.status === 'Available').length;
        const lowStockItems = materials.filter(m => m.currentStock <= m.minimumStock).length;

        const container = document.getElementById('reportsList');
        container.innerHTML = `
            <div class="card">
                <h3>📊 Production Summary</h3>
                <div class="item-info">
                    <p><strong>Total Units Planned:</strong> ${totalUnits.toLocaleString()}</p>
                    <p><strong>Active Equipment:</strong> ${activeEquipment}</p>
                    <p><strong>Total Equipment:</strong> ${equipment.length}</p>
                    <p><strong>Low Stock Items:</strong> ${lowStockItems}</p>
                    <p><strong>Total Materials:</strong> ${materials.length}</p>
                    <p><strong>Total Users:</strong> ${users.length}</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                </div>
            </div>
        `;
    }

    exportCSV() {
        try {
            const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
            const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
            const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');

            let csvContent = "data:text/csv;charset=utf-8,";
            
            // Production Plans
            csvContent += "Production Plans\n";
            csvContent += "Drug Name,Quantity,Month,Year,Status,Requested By\n";
            productionPlans.forEach(plan => {
                csvContent += `${plan.drugName},${plan.quantity},${plan.month},${plan.year},${plan.status},${plan.requestedBy}\n`;
            });
            
            csvContent += "\nEquipment\n";
            csvContent += "Name,Type,Location,Status\n";
            equipment.forEach(eq => {
                csvContent += `${eq.name},${eq.type},${eq.location},${eq.status}\n`;
            });
            
            csvContent += "\nMaterials\n";
            csvContent += "Name,Current Stock,Minimum Stock,Unit,Lead Time\n";
            materials.forEach(mat => {
                csvContent += `${mat.name},${mat.currentStock},${mat.minimumStock},${mat.unit},${mat.leadTime}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `pharma_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showToast('CSV report downloaded successfully!', 'success');
        } catch (error) {
            console.error('CSV export error:', error);
            this.showToast('Error exporting CSV', 'error');
        }
    }

    exportPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(20);
            doc.text('Pharma Planning Report', 20, 30);
            
            doc.setFontSize(12);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);
            doc.text(`Generated by: ${this.currentUser.username}`, 20, 55);
            
            const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
            const equipment = JSON.parse(localStorage.getItem('pharma
