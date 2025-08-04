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

        // Dashboard data info clicks
        document.querySelectorAll('.dashboard-card.clickable').forEach(card => {
            card.addEventListener('click', () => this.showDataInfo(card));
        });

        console.log('All event listeners attached successfully');
    }

    // **FIXED: Authentication methods**
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

    // **FIXED: UI State Management**
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
        
        this.showToast(`📊 Data Source: ${source}\n🔢 Formula: ${formula}`, 'info');
    }

    // Placeholder methods for other views
    loadProductionPlans() {
        const container = document.getElementById('productionPlansList');
        if (container) {
            container.innerHTML = '<p>Production plans feature coming soon...</p>';
        }
    }

    loadCalendar() {
        const container = document.getElementById('equipmentCalendar');
        if (container) {
            container.innerHTML = '<p>Equipment calendar feature coming soon...</p>';
        }
    }

    loadStockManagement() {
        const container = document.getElementById('materialsList');
        if (container) {
            container.innerHTML = '<p>Stock management feature coming soon...</p>';
        }
    }

    loadReports() {
        const container = document.getElementById('reportsList');
        if (container) {
            container.innerHTML = '<p>Reports feature coming soon...</p>';
        }
    }

    loadUserManagement() {
        const container = document.getElementById('usersList');
        if (container) {
            if (this.currentUser.role !== 'superadmin') {
                container.innerHTML = '<p>Access denied. Only Super Admin can manage users.</p>';
            } else {
                container.innerHTML = '<p>User management feature coming soon...</p>';
            }
        }
    }

    // Company management
    editCompanyName() {
        const nameEl = document.getElementById('companyName');
        const inputEl = document.getElementById('companyNameInput');
        
        if (nameEl && inputEl) {
            inputEl.value = nameEl.textContent;
            nameEl.classList.add('hidden');
            inputEl.classList.remove('hidden');
            inputEl.focus();
        }
    }

    saveCompanyName() {
        const nameEl = document.getElementById('companyName');
        const inputEl = document.getElementById('companyNameInput');
        
        if (nameEl && inputEl) {
            const newName = inputEl.value.trim();
            if (newName) {
                nameEl.textContent = newName;
                
                const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
                company.name = newName;
                localStorage.setItem('pharma_company', JSON.stringify(company));
                
                this.showToast('Company name updated successfully!', 'success');
            }
            
            nameEl.classList.remove('hidden');
            inputEl.classList.add('hidden');
        }
    }

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const logoUrl = event.target.result;
                const logoEl = document.getElementById('companyLogo');
                const placeholderEl = document.getElementById('logoPlaceholder');
                
                if (logoEl && placeholderEl) {
                    logoEl.src = logoUrl;
                    logoEl.classList.remove('hidden');
                    placeholderEl.style.display = 'none';
                    
                    const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
                    company.logoUrl = logoUrl;
                    localStorage.setItem('pharma_company', JSON.stringify(company));
                    
                    this.showToast('Company logo updated successfully!', 'success');
                }
            };
            reader.readAsDataURL(file);
        }
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the app when page loads
let pharmaApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        pharmaApp = new PharmaApp();
    });
} else {
    pharmaApp = new PharmaApp();
}

// Make pharmaApp globally accessible for onclick handlers
window.pharmaApp = pharmaApp;
