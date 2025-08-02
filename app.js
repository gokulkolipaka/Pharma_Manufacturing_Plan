// Application State Management
class PharmaPlanningApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.charts = {};
        this.currentEditingCell = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.initializeData();
        this.bindEvents();
        this.checkAuthState();
    }

    initializeData() {
        // Initialize sample data if not exists
        if (!localStorage.getItem('pharma_users')) {
            const sampleUsers = [
                {"id": 1, "username": "superadmin", "email": "super@pharma.com", "role": "superadmin", "password": "TempPass123!", "mustChangePassword": true, "createdDate": new Date().toISOString()},
                {"id": 2, "username": "admin1", "email": "admin@pharma.com", "role": "admin", "password": "TempPass123!", "mustChangePassword": true, "createdDate": new Date().toISOString()},
                {"id": 3, "username": "user1", "email": "user@pharma.com", "role": "user", "password": "TempPass123!", "mustChangePassword": true, "createdDate": new Date().toISOString()}
            ];
            
            const sampleCompany = {
                "name": "PharmaCorp Manufacturing",
                "logoUrl": ""
            };
            
            const sampleMaterials = [
                {"id": 1, "name": "Active Ingredient A", "currentStock": 500, "minimumStock": 100, "unit": "kg", "lastUpdated": new Date().toISOString()},
                {"id": 2, "name": "Excipient B", "currentStock": 50, "minimumStock": 150, "unit": "kg", "lastUpdated": new Date().toISOString()},
                {"id": 3, "name": "Coating Material", "currentStock": 200, "minimumStock": 80, "unit": "kg", "lastUpdated": new Date().toISOString()}
            ];
            
            const sampleEquipment = [
                {"id": 1, "name": "Tablet Press 1", "type": "Manufacturing", "status": "Available", "location": "Production Floor A"},
                {"id": 2, "name": "Coating Machine", "type": "Manufacturing", "status": "Available", "location": "Production Floor B"},
                {"id": 3, "name": "Blender Unit 1", "type": "Mixing", "status": "Maintenance", "location": "Production Floor A"}
            ];
            
            const sampleProductionPlans = [
                {"id": 1, "drugName": "Aspirin 100mg", "quantity": 10000, "month": "March", "year": 2025, "status": "Planned", "requestedBy": "BD Team", "createdDate": new Date().toISOString()},
                {"id": 2, "drugName": "Vitamin C 500mg", "quantity": 5000, "month": "March", "year": 2025, "status": "In Progress", "requestedBy": "BD Team", "createdDate": new Date().toISOString()}
            ];

            localStorage.setItem('pharma_users', JSON.stringify(sampleUsers));
            localStorage.setItem('pharma_company', JSON.stringify(sampleCompany));
            localStorage.setItem('pharma_materials', JSON.stringify(sampleMaterials));
            localStorage.setItem('pharma_equipment', JSON.stringify(sampleEquipment));
            localStorage.setItem('pharma_production_plans', JSON.stringify(sampleProductionPlans));
            localStorage.setItem('pharma_calendar', JSON.stringify([]));
            localStorage.setItem('pharma_alerts', JSON.stringify([]));
        }
    }

    bindEvents() {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.attachEventListeners();
        });
        
        // If DOM is already ready, attach immediately
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.attachEventListeners();
            });
        } else {
            this.attachEventListeners();
        }
    }

    attachEventListeners() {
        // Authentication Events
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
        
        const passwordChangeForm = document.getElementById('password-change-form');
        if (passwordChangeForm) {
            passwordChangeForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        }
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Company Management
        const logoPlaceholder = document.getElementById('logo-placeholder');
        if (logoPlaceholder) {
            logoPlaceholder.addEventListener('click', () => {
                const logoUpload = document.getElementById('logo-upload');
                if (logoUpload) logoUpload.click();
            });
        }
        
        const logoUpload = document.getElementById('logo-upload');
        if (logoUpload) {
            logoUpload.addEventListener('change', (e) => this.handleLogoUpload(e));
        }
        
        const companyName = document.getElementById('company-name');
        if (companyName) {
            companyName.addEventListener('click', () => this.enableCompanyNameEdit());
        }
        
        const companyNameInput = document.getElementById('company-name-input');
        if (companyNameInput) {
            companyNameInput.addEventListener('blur', () => this.saveCompanyName());
            companyNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.saveCompanyName();
            });
        }

        // Production Planning
        const addProductionBtn = document.getElementById('add-production-btn');
        if (addProductionBtn) {
            addProductionBtn.addEventListener('click', () => this.showModal('add-production-modal'));
        }
        
        const addProductionForm = document.getElementById('add-production-form');
        if (addProductionForm) {
            addProductionForm.addEventListener('submit', (e) => this.handleAddProduction(e));
        }

        // Calendar
        const prevMonthBtn = document.getElementById('prev-month');
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        }
        
        const nextMonthBtn = document.getElementById('next-month');
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        }
        
        const calendarEditForm = document.getElementById('calendar-edit-form');
        if (calendarEditForm) {
            calendarEditForm.addEventListener('submit', (e) => this.handleCalendarEdit(e));
        }

        // Stock Management
        const addMaterialBtn = document.getElementById('add-material-btn');
        if (addMaterialBtn) {
            addMaterialBtn.addEventListener('click', () => this.showModal('add-material-modal'));
        }
        
        const uploadStockBtn = document.getElementById('upload-stock-btn');
        if (uploadStockBtn) {
            uploadStockBtn.addEventListener('click', () => {
                const excelUpload = document.getElementById('excel-upload');
                if (excelUpload) excelUpload.click();
            });
        }
        
        const excelUpload = document.getElementById('excel-upload');
        if (excelUpload) {
            excelUpload.addEventListener('change', (e) => this.handleExcelUpload(e));
        }
        
        const addMaterialForm = document.getElementById('add-material-form');
        if (addMaterialForm) {
            addMaterialForm.addEventListener('submit', (e) => this.handleAddMaterial(e));
        }

        // Reports
        const exportCsvBtn = document.getElementById('export-csv-btn');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.exportToCSV());
        }
        
        const exportPdfBtn = document.getElementById('export-pdf-btn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportToPDF());
        }
        
        const printReportBtn = document.getElementById('print-report-btn');
        if (printReportBtn) {
            printReportBtn.addEventListener('click', () => window.print());
        }

        // User Management
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showModal('add-user-modal'));
        }

        // Modal Events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    checkAuthState() {
        const savedUser = localStorage.getItem('pharma_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.showMainApp();
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('pharma_current_user');
                this.showLoginScreen();
            }
        } else {
            this.showLoginScreen();
        }
    }

    // Authentication Methods
    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            this.showToast('Please enter both username and password', 'error');
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                this.currentUser = user;
                localStorage.setItem('pharma_current_user', JSON.stringify(user));
                
                if (user.mustChangePassword) {
                    this.showToast('Login successful! Please change your password.', 'success');
                    setTimeout(() => {
                        this.showModal('password-change-modal');
                    }, 500);
                } else {
                    this.showToast('Login successful!', 'success');
                    setTimeout(() => {
                        this.showMainApp();
                    }, 500);
                }
            } else {
                this.showToast('Invalid username or password', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Login failed. Please try again.', 'error');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const role = document.getElementById('signup-role').value;

        if (!username || !email || !password) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        try {
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
                createdDate: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('pharma_users', JSON.stringify(users));
            this.showToast('Account created successfully! Please login.', 'success');
            this.switchTab('login');
            document.getElementById('signup-form').reset();
        } catch (error) {
            console.error('Signup error:', error);
            this.showToast('Signup failed. Please try again.', 'error');
        }
    }

    handlePasswordChange(e) {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showToast('Password must be at least 8 characters long', 'error');
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                users[userIndex].mustChangePassword = false;
                localStorage.setItem('pharma_users', JSON.stringify(users));
                
                this.currentUser = users[userIndex];
                localStorage.setItem('pharma_current_user', JSON.stringify(this.currentUser));
                
                this.hideModal('password-change-modal');
                this.showToast('Password changed successfully!', 'success');
                setTimeout(() => {
                    this.showMainApp();
                }, 500);
            }
        } catch (error) {
            console.error('Password change error:', error);
            this.showToast('Password change failed. Please try again.', 'error');
        }
    }

    handleLogout() {
        localStorage.removeItem('pharma_current_user');
        this.currentUser = null;
        this.showLoginScreen();
        this.showToast('Logged out successfully', 'info');
    }

    // UI Management
    showLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        if (loginScreen) {
            loginScreen.classList.remove('hidden');
            loginScreen.style.display = 'flex';
        }
        if (mainApp) {
            mainApp.classList.add('hidden');
            mainApp.style.display = 'none';
        }
    }

    showMainApp() {
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        if (loginScreen) {
            loginScreen.classList.add('hidden');
            loginScreen.style.display = 'none';
        }
        if (mainApp) {
            mainApp.classList.remove('hidden');
            mainApp.style.display = 'flex';
        }
        
        this.updateUserInterface();
        setTimeout(() => {
            this.loadDashboard();
        }, 100);
    }

    updateUserInterface() {
        const userWelcome = document.getElementById('user-welcome');
        if (userWelcome && this.currentUser) {
            userWelcome.textContent = `Welcome, ${this.currentUser.username}`;
        }
        
        // Show/hide admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            if (this.currentUser && this.currentUser.role === 'superadmin') {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });

        // Load company info
        try {
            const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
            const companyNameEl = document.getElementById('company-name');
            if (companyNameEl) {
                companyNameEl.textContent = company.name || 'PharmaCorp Manufacturing';
            }
            
            if (company.logoUrl) {
                const logoEl = document.getElementById('company-logo');
                const placeholderEl = document.getElementById('logo-placeholder');
                if (logoEl && placeholderEl) {
                    logoEl.src = company.logoUrl;
                    logoEl.classList.remove('hidden');
                    placeholderEl.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Error loading company info:', error);
        }
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
        const tabForm = document.getElementById(`${tab}-form`);
        
        if (tabBtn) tabBtn.classList.add('active');
        if (tabForm) tabForm.classList.add('active');
    }

    switchView(view) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        
        const navBtn = document.querySelector(`[data-view="${view}"]`);
        const viewEl = document.getElementById(`${view}-view`);
        
        if (navBtn) navBtn.classList.add('active');
        if (viewEl) viewEl.classList.add('active');
        
        this.currentView = view;
        this.loadViewData(view);
    }

    loadViewData(view) {
        switch(view) {
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
        try {
            const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
            const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
            const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');

            // Update stats
            const totalProduction = productionPlans.reduce((sum, plan) => sum + plan.quantity, 0);
            const totalProductionEl = document.getElementById('total-production');
            if (totalProductionEl) {
                totalProductionEl.textContent = totalProduction.toLocaleString();
            }

            const availableEquipment = equipment.filter(eq => eq.status === 'Available').length;
            const busyEquipment = equipment.filter(eq => eq.status === 'In Use').length;
            const maintenanceEquipment = equipment.filter(eq => eq.status === 'Maintenance').length;

            const availableEl = document.getElementById('available-equipment');
            const busyEl = document.getElementById('busy-equipment');
            const maintenanceEl = document.getElementById('maintenance-equipment');
            
            if (availableEl) availableEl.textContent = availableEquipment;
            if (busyEl) busyEl.textContent = busyEquipment;
            if (maintenanceEl) maintenanceEl.textContent = maintenanceEquipment;

            // Stock alerts
            const lowStockMaterials = materials.filter(m => m.currentStock <= m.minimumStock);
            const alertsContainer = document.getElementById('stock-alerts');
            if (alertsContainer) {
                alertsContainer.innerHTML = '';

                if (lowStockMaterials.length === 0) {
                    alertsContainer.innerHTML = '<p style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">No stock alerts</p>';
                } else {
                    lowStockMaterials.forEach(material => {
                        const alertDiv = document.createElement('div');
                        alertDiv.className = 'alert-item';
                        alertDiv.textContent = `Low stock: ${material.name} (${material.currentStock} ${material.unit} remaining)`;
                        alertsContainer.appendChild(alertDiv);
                    });
                }
            }

            // Load production chart with delay to ensure canvas is rendered
            setTimeout(() => {
                this.loadProductionChart();
            }, 200);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showToast('Error loading dashboard data', 'error');
        }
    }

    loadProductionChart() {
        try {
            const ctx = document.getElementById('production-chart');
            if (!ctx) return;
            
            const chartCtx = ctx.getContext('2d');
            const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');

            const monthlyData = {};
            productionPlans.forEach(plan => {
                const key = `${plan.month} ${plan.year}`;
                monthlyData[key] = (monthlyData[key] || 0) + plan.quantity;
            });

            const labels = Object.keys(monthlyData);
            const data = Object.values(monthlyData);

            if (this.charts.production) {
                this.charts.production.destroy();
            }

            this.charts.production = new Chart(chartCtx, {
                type: 'bar',
                data: {
                    labels: labels.length > 0 ? labels : ['March 2025'],
                    datasets: [{
                        label: 'Production Quantity',
                        data: data.length > 0 ? data : [15000],
                        backgroundColor: '#1FB8CD',
                        borderColor: '#1FB8CD',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading production chart:', error);
        }
    }

    // Production Planning Methods
    loadProductionPlans() {
        try {
            const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
            const container = document.getElementById('production-plans-list');
            if (!container) return;
            
            container.innerHTML = '';

            if (productionPlans.length === 0) {
                container.innerHTML = '<p style="color: var(--color-text-secondary);">No production plans yet. Click "Add Production Plan" to get started.</p>';
                return;
            }

            productionPlans.forEach(plan => {
                const planDiv = document.createElement('div');
                planDiv.className = 'production-plan-item';
                planDiv.innerHTML = `
                    <div class="production-plan-info">
                        <h4>${plan.drugName}</h4>
                        <p>Quantity: ${plan.quantity.toLocaleString()} units | Target: ${plan.month} ${plan.year} | Status: ${plan.status}</p>
                    </div>
                    <div class="production-plan-actions">
                        <button class="btn btn--sm btn--outline" onclick="app.editProductionPlan(${plan.id})">Edit</button>
                        <button class="btn btn--sm btn--secondary" onclick="app.deleteProductionPlan(${plan.id})">Delete</button>
                    </div>
                `;
                container.appendChild(planDiv);
            });
        } catch (error) {
            console.error('Error loading production plans:', error);
            this.showToast('Error loading production plans', 'error');
        }
    }

    handleAddProduction(e) {
        e.preventDefault();
        try {
            const drugName = document.getElementById('drug-name').value.trim();
            const quantity = parseInt(document.getElementById('quantity').value);
            const month = document.getElementById('target-month').value;
            const year = parseInt(document.getElementById('target-year').value);

            if (!drugName || !quantity || !month || !year) {
                this.showToast('Please fill in all fields', 'error');
                return;
            }

            const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
            const newPlan = {
                id: Date.now(),
                drugName,
                quantity,
                month,
                year,
                status: 'Planned',
                requestedBy: this.currentUser ? this.currentUser.username : 'Unknown',
                createdDate: new Date().toISOString()
            };

            productionPlans.push(newPlan);
            localStorage.setItem('pharma_production_plans', JSON.stringify(productionPlans));
            
            this.hideModal('add-production-modal');
            this.loadProductionPlans();
            this.showToast('Production plan added successfully!', 'success');
            document.getElementById('add-production-form').reset();

            // Check stock levels and equipment availability
            this.checkResourceAvailability(newPlan);
        } catch (error) {
            console.error('Error adding production plan:', error);
            this.showToast('Error adding production plan', 'error');
        }
    }

    checkResourceAvailability(plan) {
        try {
            const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
            const lowStockMaterials = materials.filter(m => m.currentStock <= m.minimumStock);
            
            if (lowStockMaterials.length > 0) {
                this.showToast(`Warning: Low stock detected for ${lowStockMaterials.length} materials`, 'warning');
                this.sendProcurementAlert(lowStockMaterials);
            }
        } catch (error) {
            console.error('Error checking resource availability:', error);
        }
    }

    sendProcurementAlert(materials) {
        try {
            const alerts = JSON.parse(localStorage.getItem('pharma_alerts') || '[]');
            const newAlert = {
                id: Date.now(),
                type: 'procurement',
                message: `Low stock alert: ${materials.map(m => m.name).join(', ')}`,
                isRead: false,
                createdDate: new Date().toISOString()
            };
            alerts.push(newAlert);
            localStorage.setItem('pharma_alerts', JSON.stringify(alerts));
        } catch (error) {
            console.error('Error sending procurement alert:', error);
        }
    }

    deleteProductionPlan(id) {
        if (confirm('Are you sure you want to delete this production plan?')) {
            try {
                const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
                const updatedPlans = productionPlans.filter(plan => plan.id !== id);
                localStorage.setItem('pharma_production_plans', JSON.stringify(updatedPlans));
                this.loadProductionPlans();
                this.showToast('Production plan deleted', 'info');
            } catch (error) {
                console.error('Error deleting production plan:', error);
                this.showToast('Error deleting production plan', 'error');
            }
        }
    }

    // Calendar Methods
    loadCalendar() {
        try {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            
            const currentMonthEl = document.getElementById('current-month');
            if (currentMonthEl) {
                currentMonthEl.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
            }
            
            const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
            const calendar = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');
            const container = document.getElementById('equipment-calendar');
            if (!container) return;
            
            const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
            
            container.innerHTML = '';
            container.style.gridTemplateColumns = `150px repeat(${daysInMonth}, 1fr)`;
            
            // Header row
            const headerCell = document.createElement('div');
            headerCell.className = 'calendar-header';
            headerCell.textContent = 'Equipment';
            container.appendChild(headerCell);
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'calendar-header';
                dayCell.textContent = day;
                container.appendChild(dayCell);
            }
            
            // Equipment rows
            equipment.forEach(eq => {
                const equipmentHeader = document.createElement('div');
                equipmentHeader.className = 'calendar-equipment-header';
                equipmentHeader.textContent = eq.name;
                container.appendChild(equipmentHeader);
                
                for (let day = 1; day <= daysInMonth; day++) {
                    const cellKey = `${this.currentYear}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${eq.id}`;
                    const cellData = calendar.find(c => c.key === cellKey);
                    
                    const cell = document.createElement('div');
                    cell.className = 'calendar-cell';
                    cell.dataset.equipmentId = eq.id;
                    cell.dataset.date = `${this.currentYear}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    
                    if (cellData) {
                        cell.classList.add(cellData.status.toLowerCase().replace(' ', '-'));
                        cell.innerHTML = `
                            <div class="batch-info">${cellData.batchNumber || ''}</div>
                            <div class="batch-notes">${cellData.notes || ''}</div>
                        `;
                    }
                    
                    if (this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'superadmin')) {
                        cell.addEventListener('click', () => this.editCalendarCell(cell));
                        cell.style.cursor = 'pointer';
                        cell.title = 'Click to edit';
                    }
                    
                    container.appendChild(cell);
                }
            });
        } catch (error) {
            console.error('Error loading calendar:', error);
            this.showToast('Error loading calendar', 'error');
        }
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

    editCalendarCell(cell) {
        try {
            const calendar = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');
            const cellKey = `${cell.dataset.date}-${cell.dataset.equipmentId}`;
            const cellData = calendar.find(c => c.key === cellKey);
            
            const batchNumberEl = document.getElementById('batch-number');
            const scheduleNotesEl = document.getElementById('schedule-notes');
            const scheduleStatusEl = document.getElementById('schedule-status');
            
            if (batchNumberEl) batchNumberEl.value = cellData?.batchNumber || '';
            if (scheduleNotesEl) scheduleNotesEl.value = cellData?.notes || '';
            if (scheduleStatusEl) scheduleStatusEl.value = cellData?.status || 'Available';
            
            this.currentEditingCell = { cell, cellKey };
            this.showModal('calendar-edit-modal');
        } catch (error) {
            console.error('Error editing calendar cell:', error);
            this.showToast('Error editing calendar cell', 'error');
        }
    }

    handleCalendarEdit(e) {
        e.preventDefault();
        try {
            if (!this.currentEditingCell) return;
            
            const batchNumber = document.getElementById('batch-number').value.trim();
            const notes = document.getElementById('schedule-notes').value.trim();
            const status = document.getElementById('schedule-status').value;
            
            const calendar = JSON.parse(localStorage.getItem('pharma_calendar') || '[]');
            const existingIndex = calendar.findIndex(c => c.key === this.currentEditingCell.cellKey);
            
            const cellData = {
                key: this.currentEditingCell.cellKey,
                equipmentId: parseInt(this.currentEditingCell.cell.dataset.equipmentId),
                date: this.currentEditingCell.cell.dataset.date,
                batchNumber,
                notes,
                status,
                assignedBy: this.currentUser ? this.currentUser.username : 'Unknown',
                lastUpdated: new Date().toISOString()
            };
            
            if (existingIndex >= 0) {
                calendar[existingIndex] = cellData;
            } else {
                calendar.push(cellData);
            }
            
            localStorage.setItem('pharma_calendar', JSON.stringify(calendar));
            this.hideModal('calendar-edit-modal');
            this.loadCalendar();
            this.showToast('Schedule updated successfully!', 'success');
        } catch (error) {
            console.error('Error handling calendar edit:', error);
            this.showToast('Error updating schedule', 'error');
        }
    }

    // Stock Management Methods
    loadStockManagement() {
        try {
            const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
            const container = document.getElementById('materials-list');
            if (!container) return;
            
            container.innerHTML = '';

            if (materials.length === 0) {
                container.innerHTML = '<p style="color: var(--color-text-secondary);">No materials in inventory. Click "Add Material" to get started.</p>';
                return;
            }

            materials.forEach(material => {
                const materialDiv = document.createElement('div');
                materialDiv.className = `material-item ${material.currentStock <= material.minimumStock ? 'low-stock' : ''}`;
                materialDiv.innerHTML = `
                    <div class="material-info">
                        <h4>${material.name}</h4>
                        <div class="stock-levels">
                            <span class="stock-current">Current: ${material.currentStock} ${material.unit}</span>
                            <span class="stock-minimum">Minimum: ${material.minimumStock} ${material.unit}</span>
                        </div>
                    </div>
                    <div class="stock-actions-item">
                        <button class="btn btn--sm btn--outline" onclick="app.editMaterial(${material.id})">Edit</button>
                        <button class="btn btn--sm btn--secondary" onclick="app.deleteMaterial(${material.id})">Delete</button>
                    </div>
                `;
                container.appendChild(materialDiv);
            });
        } catch (error) {
            console.error('Error loading stock management:', error);
            this.showToast('Error loading stock data', 'error');
        }
    }

    handleAddMaterial(e) {
        e.preventDefault();
        try {
            const name = document.getElementById('material-name').value.trim();
            const currentStock = parseFloat(document.getElementById('current-stock').value);
            const minimumStock = parseFloat(document.getElementById('minimum-stock').value);
            const unit = document.getElementById('stock-unit').value;

            if (!name || isNaN(currentStock) || isNaN(minimumStock)) {
                this.showToast('Please fill in all fields with valid values', 'error');
                return;
            }

            const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
            const newMaterial = {
                id: Date.now(),
                name,
                currentStock,
                minimumStock,
                unit,
                lastUpdated: new Date().toISOString()
            };

            materials.push(newMaterial);
            localStorage.setItem('pharma_materials', JSON.stringify(materials));
            
            this.hideModal('add-material-modal');
            this.loadStockManagement();
            this.showToast('Material added successfully!', 'success');
            document.getElementById('add-material-form').reset();
        } catch (error) {
            console.error('Error adding material:', error);
            this.showToast('Error adding material', 'error');
        }
    }

    deleteMaterial(id) {
        if (confirm('Are you sure you want to delete this material?')) {
            try {
                const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');
                const updatedMaterials = materials.filter(material => material.id !== id);
                localStorage.setItem('pharma_materials', JSON.stringify(updatedMaterials));
                this.loadStockManagement();
                this.showToast('Material deleted', 'info');
            } catch (error) {
                console.error('Error deleting material:', error);
                this.showToast('Error deleting material', 'error');
            }
        }
    }

    handleExcelUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Simulate Excel upload processing
        this.showToast('Excel file processing simulated - would require server-side integration in production', 'info');
        
        // Reset file input
        e.target.value = '';
    }

    // Reports Methods
    loadReports() {
        try {
            const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
            const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');
            const materials = JSON.parse(localStorage.getItem('pharma_materials') || '[]');

            // Production summary
            const summaryContainer = document.getElementById('production-summary');
            if (summaryContainer) {
                summaryContainer.innerHTML = '';

                const summaryData = [
                    { label: 'Total Production Plans', value: productionPlans.length },
                    { label: 'Total Planned Units', value: productionPlans.reduce((sum, p) => sum + p.quantity, 0).toLocaleString() },
                    { label: 'Active Plans', value: productionPlans.filter(p => p.status !== 'Completed').length },
                    { label: 'Total Equipment', value: equipment.length },
                    { label: 'Available Equipment', value: equipment.filter(e => e.status === 'Available').length },
                    { label: 'Raw Materials', value: materials.length },
                    { label: 'Low Stock Items', value: materials.filter(m => m.currentStock <= m.minimumStock).length }
                ];

                summaryData.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'summary-item';
                    itemDiv.innerHTML = `
                        <span class="summary-label">${item.label}</span>
                        <span class="summary-value">${item.value}</span>
                    `;
                    summaryContainer.appendChild(itemDiv);
                });
            }

            // Equipment utilization chart
            setTimeout(() => {
                this.loadUtilizationChart();
            }, 200);
        } catch (error) {
            console.error('Error loading reports:', error);
            this.showToast('Error loading reports', 'error');
        }
    }

    loadUtilizationChart() {
        try {
            const ctx = document.getElementById('utilization-chart');
            if (!ctx) return;
            
            const chartCtx = ctx.getContext('2d');
            const equipment = JSON.parse(localStorage.getItem('pharma_equipment') || '[]');

            const statusCounts = equipment.reduce((acc, eq) => {
                acc[eq.status] = (acc[eq.status] || 0) + 1;
                return acc;
            }, {});

            const labels = Object.keys(statusCounts);
            const data = Object.values(statusCounts);
            const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'];

            if (this.charts.utilization) {
                this.charts.utilization.destroy();
            }

            this.charts.utilization = new Chart(chartCtx, {
                type: 'doughnut',
                data: {
                    labels: labels.length > 0 ? labels : ['Available', 'Maintenance'],
                    datasets: [{
                        data: data.length > 0 ? data : [2, 1],
                        backgroundColor: colors.slice(0, Math.max(labels.length, 2)),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading utilization chart:', error);
        }
    }

    exportToCSV() {
        try {
            const productionPlans = JSON.parse(localStorage.getItem('pharma_production_plans') || '[]');
            let csv = 'Drug Name,Quantity,Month,Year,Status,Requested By,Created Date\n';
            
            productionPlans.forEach(plan => {
                csv += `"${plan.drugName}",${plan.quantity},"${plan.month}",${plan.year},"${plan.status}","${plan.requestedBy}","${plan.createdDate}"\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `production_report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            this.showToast('CSV report exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            this.showToast('Error exporting CSV', 'error');
        }
    }

    exportToPDF() {
        // Simulate PDF export
        this.showToast('PDF export feature - would require jsPDF library integration', 'info');
    }

    // User Management Methods
    loadUserManagement() {
        if (!this.currentUser || this.currentUser.role !== 'superadmin') return;

        try {
            const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
            const container = document.getElementById('users-list');
            if (!container) return;
            
            container.innerHTML = '';

            users.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.className = 'user-item';
                userDiv.innerHTML = `
                    <div class="user-info">
                        <h4>${user.username}</h4>
                        <div class="user-details">${user.email} | <span class="user-role ${user.role}">${user.role}</span></div>
                    </div>
                    <div class="user-actions">
                        <button class="btn btn--sm btn--outline" onclick="app.editUser(${user.id})">Edit</button>
                        <button class="btn btn--sm btn--secondary" onclick="app.deleteUser(${user.id})">Delete</button>
                    </div>
                `;
                container.appendChild(userDiv);
            });
        } catch (error) {
            console.error('Error loading user management:', error);
            this.showToast('Error loading users', 'error');
        }
    }

    deleteUser(id) {
        if (!this.currentUser || id === this.currentUser.id) {
            this.showToast('Cannot delete your own account', 'error');
            return;
        }

        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const users = JSON.parse(localStorage.getItem('pharma_users') || '[]');
                const updatedUsers = users.filter(user => user.id !== id);
                localStorage.setItem('pharma_users', JSON.stringify(updatedUsers));
                this.loadUserManagement();
                this.showToast('User deleted', 'info');
            } catch (error) {
                console.error('Error deleting user:', error);
                this.showToast('Error deleting user', 'error');
            }
        }
    }

    // Company Management Methods
    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showToast('File size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const logoUrl = event.target.result;
                const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
                company.logoUrl = logoUrl;
                localStorage.setItem('pharma_company', JSON.stringify(company));
                
                const logoEl = document.getElementById('company-logo');
                const placeholderEl = document.getElementById('logo-placeholder');
                
                if (logoEl && placeholderEl) {
                    logoEl.src = logoUrl;
                    logoEl.classList.remove('hidden');
                    placeholderEl.classList.add('hidden');
                }
                
                this.showToast('Logo updated successfully!', 'success');
            } catch (error) {
                console.error('Error uploading logo:', error);
                this.showToast('Error uploading logo', 'error');
            }
        };
        reader.readAsDataURL(file);
    }

    enableCompanyNameEdit() {
        const nameElement = document.getElementById('company-name');
        const inputElement = document.getElementById('company-name-input');
        
        if (nameElement && inputElement) {
            inputElement.value = nameElement.textContent;
            nameElement.classList.add('hidden');
            inputElement.classList.remove('hidden');
            inputElement.focus();
        }
    }

    saveCompanyName() {
        const nameElement = document.getElementById('company-name');
        const inputElement = document.getElementById('company-name-input');
        
        if (nameElement && inputElement) {
            const newName = inputElement.value.trim();
            if (newName) {
                try {
                    const company = JSON.parse(localStorage.getItem('pharma_company') || '{}');
                    company.name = newName;
                    localStorage.setItem('pharma_company', JSON.stringify(company));
                    
                    nameElement.textContent = newName;
                    this.showToast('Company name updated!', 'success');
                } catch (error) {
                    console.error('Error saving company name:', error);
                    this.showToast('Error updating company name', 'error');
                }
            }
            
            nameElement.classList.remove('hidden');
            inputElement.classList.add('hidden');
        }
    }

    // Utility Methods
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 100);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }, 3000);
        }
    }

    // Placeholder methods for future implementation
    editProductionPlan(id) {
        this.showToast('Edit production plan feature - would open edit modal with plan details', 'info');
    }

    editMaterial(id) {
        this.showToast('Edit material feature - would open edit modal with material details', 'info');
    }

    editUser(id) {
        this.showToast('Edit user feature - would open edit modal with user details', 'info');
    }
}

// Initialize the application when DOM is ready
let app;

function initializeApp() {
    app = new PharmaPlanningApp();
}

// Multiple ways to ensure the app initializes
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    if (app && app.showToast) {
        app.showToast('An error occurred. Please try again.', 'error');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!app) return;
    
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                if (app.currentView === 'reports') {
                    app.exportToCSV();
                }
                break;
            case 'p':
                e.preventDefault();
                if (app.currentView === 'reports') {
                    window.print();
                }
                break;
        }
    }
    
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            app.hideModal(modal.id);
        });
    }
});